<?php

namespace App\Domain\Lattes;

use App\Domain\Lattes\Exceptions\InvalidXml;
use App\Enums\ProductionSource;
use App\Enums\PublisherType;
use App\Models\Conference;
use App\Models\Journal;
use App\Models\Publishers;
use DOMDocument;
use Exception;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Storage;
use SimpleXMLElement;
use Str;
use ZipArchive;

class LattesZipXml
{
    protected function __construct(protected string $storagePath)
    {
    }

    /**
     * @return array{
     *     lattes_id: string,
     *     lattes_updated_at: Carbon,
     *     productions: array<int, array{
     *          source: string,
     *          title: string,
     *          year: string,
     *          publisher_id: string,
     *          publisher_type: string,
     *          doi: string,
     *          sequence_number: string
     *      }>
     * }
     * @throws InvalidXml
     */
    public static function extractProductions(string $storagePath): array
    {
        $loadXml = new static($storagePath);
        $xml = $loadXml->loadFile();
        $lattesUpdatedAt = "{$xml->attributes()['DATA-ATUALIZACAO']}{$xml->attributes()['HORA-ATUALIZACAO']}";
        $data = [
            'lattes_id' => (string)$xml->attributes()['NUMERO-IDENTIFICADOR'],
            'name' => (string)$xml->{'DADOS-GERAIS'}->attributes()['NOME-COMPLETO'],
            'lattes_updated_at' => Carbon::createFromFormat('dmYHis', $lattesUpdatedAt),
            'productions' => [],
        ];

        $productions = $xml->{'PRODUCAO-BIBLIOGRAFICA'}->{'ARTIGOS-PUBLICADOS'}->{'ARTIGO-PUBLICADO'} ?? [];
        /** @var SimpleXMLElement $item */
        foreach ($productions as $item) {
            $doi = (string)$item->{'DADOS-BASICOS-DO-ARTIGO'}->attributes()['DOI'];
            if (!trim($doi)) {
                continue;
            }
            $title = (string)$item->{'DADOS-BASICOS-DO-ARTIGO'}->attributes()['TITULO-DO-ARTIGO'];
            $year = (string)$item->{'DADOS-BASICOS-DO-ARTIGO'}->attributes()['ANO-DO-ARTIGO'];
            $issn = (string)$item->{'DETALHAMENTO-DO-ARTIGO'}->attributes()['ISSN'];
            $sequence_number = (string)$item->attributes()['SEQUENCIA-PRODUCAO'];
            $publisher_id = null;
            $publisher_type = PublisherType::JOURNAL->value;
            $source = ProductionSource::MANUAL;

            if ($issn) {
                $issn = Str::of($issn)->trim()->remove('-')->value();
                $publisher_id = Publishers::where('issn', $issn)->first()?->id;
                error_log($publisher_id);
            }

            $production = compact('source','title', 'year', 'publisher_id', 'publisher_type', 'doi', 'sequence_number');
            $data['productions'][] = $production;
        }

        $productions = $xml->{'PRODUCAO-BIBLIOGRAFICA'}->{'TRABALHOS-EM-EVENTOS'}->{'TRABALHO-EM-EVENTOS'} ?? [];
        /** @var SimpleXMLElement $item */
        foreach ($productions as $item) {
            $doi = (string)$item->{'DADOS-BASICOS-DO-TRABALHO'}->attributes()['DOI'];
            if (!trim($doi)) {
                continue;
            }
            $title = (string)$item->{'DADOS-BASICOS-DO-TRABALHO'}->attributes()['TITULO-DO-TRABALHO'];
            $year = (string)$item->{'DADOS-BASICOS-DO-TRABALHO'}->attributes()['ANO-DO-TRABALHO'];
            $issn = (string)$item->{'DADOS-BASICOS-DO-TRABALHO'}->attributes()['ISSN'];
            $isbn = (string)$item->{'DADOS-BASICOS-DO-TRABALHO'}->attributes()['ISBN'];
            $conferenceName = (string)$item->{'DETALHAMENTO-DO-TRABALHO'}->attributes()['NOME-DO-EVENTO'];
            $sequence_number = (string)$item->attributes()['SEQUENCIA-PRODUCAO'];
            $publisher_id = null;
            $publisher_type = PublisherType::CONFERENCE->value;
            $source = ProductionSource::MANUAL->value;

            if ($conferenceName) {
                $publisher_id = Publishers::where('name', $conferenceName)->first()?->id;
            }

            $production = compact('source','title', 'year', 'publisher_id', 'publisher_type', 'doi', 'sequence_number', 'issn', 'isbn');
            $data['productions'][] = $production;
        }

        return $data;
    }

    /**
     * @throws InvalidXml
     * @throws Exception
     */
    private function loadFile(): SimpleXMLElement
    {
        $mimeType = Storage::mimeType($this->storagePath);
        if ($mimeType === 'application/zip') {
            $file = $this->extractXmlFromZip();
        } elseif (in_array($mimeType, ['application/xml', 'text/xml'])) {
            $file = Storage::get($this->storagePath);
        } else {
            throw new Exception("Invalid MIME type {$mimeType}.");
        }
        //$this->validate($file);

        return simplexml_load_string($file);
    }

    /**
     * @throws Exception
     */
    private function extractXmlFromZip(): ?string
    {
        $zip = new ZipArchive();
        if (!$zip->open(Storage::path($this->storagePath))) {
            throw new Exception('Invalid Zip file.');
        }
        $fileCount = $zip->numFiles;
        if($fileCount > 1) {
            throw new Exception('Multiple files in Zip.');
        } elseif ($fileCount < 1) {
            throw new Exception('No files in Zip.');
        }
        $filename = $zip->getNameIndex(0);
        $file = $zip->getFromName($filename);
        $zip->close();
        if (empty($file)) {
            throw new Exception('File is empty.');
        }

        return $file;
    }

    /**
     * @throws InvalidXml
     */
    private function validate(string $file): void
    {
        $xml = new DOMDocument();
        $xml->loadXML($file);

        $xsdPath = app_path('Domain/Lattes/xml_cvbase_src_main_resources_CurriculoLattes2022.xsd');

        $oldUseInternalErrors = libxml_use_internal_errors(true);
        $isValid = $xml->schemaValidate($xsdPath);
        $errors = libxml_get_errors();
        libxml_clear_errors();
        libxml_use_internal_errors($oldUseInternalErrors);


        if (!$isValid) {
            throw new InvalidXml($errors);
        }
    }
}
