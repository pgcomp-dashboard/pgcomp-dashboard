<?php

namespace App\Domain\Lattes;

use App\Domain\Lattes\Exceptions\InvalidXml;
use App\Enums\ProductionSource;
use App\Enums\PublisherType;
use App\Models\Conference;
use App\Models\Journal;
use App\Models\Publishers;
use App\Models\StratumQualis;
use App\Services\ProductionService;
use DOMDocument;
use Exception;
use GuzzleHttp\Client;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Storage;
use SimpleXMLElement;
use Str;
use ZipArchive;

class LattesZipXml
{
    protected $clientHttp;

    protected function __construct(protected string $storagePath)
    {
        $this->clientHttp = new Client;
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
     *          nature: string,
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
            trim($doi);
            $doi = "http://dx.doi.org/$doi";
            $title = (string)$item->{'DADOS-BASICOS-DO-ARTIGO'}->attributes()['TITULO-DO-ARTIGO'];
            $year = (string)$item->{'DADOS-BASICOS-DO-ARTIGO'}->attributes()['ANO-DO-ARTIGO'];
            $rawHomePageData = (string)$item->{'DADOS-BASICOS-DO-ARTIGO'}->attributes()['HOME-PAGE-DO-TRABALHO'];
            $home_page = "";
            $rawHomePageData = trim($rawHomePageData);
            if (!empty($rawHomePageData)){
                // Strips [] from "[data]" and "[data1][data2]"
                $cleanContent = trim($rawHomePageData, '[]');
                if (strpos($cleanContent, '][') !== false) {
                    //If it contains multiple parts "[url][doi]", split and take the first
                    $parts = explode('][', $cleanContent);
                    $result = $parts[0];
                } else {
                    $result = $cleanContent;
                }
                $home_page = str_ireplace(['http://https://','http://http://'], 'https://', $result);
                $home_page = str_ireplace('doi:', 'http://dx.doi.org/', $home_page);
            }
            $issn = (string)$item->{'DETALHAMENTO-DO-ARTIGO'}->attributes()['ISSN'];
            $publisher_name = (string)$item->{'DETALHAMENTO-DO-ARTIGO'}->attributes()['TITULO-DO-PERIODICO-OU-REVISTA'];
            $nature = (string)$item->{'DADOS-BASICOS-DO-ARTIGO'}->attributes()['NATUREZA'];
            $sequence_number = (string)$item->attributes()['SEQUENCIA-PRODUCAO'];
            $publisher_id = null;
            $publisher_type = PublisherType::JOURNAL->value;
            $source = ProductionSource::XML->value;

            if ($issn) {
                $issn = Str::of($issn)->trim()->remove('-')->value();
                $publisher = Publishers::whereHas('issns', function ($q) use ($issn) {
                    $q->where('issn', $issn);
                })->first();

                if (!$publisher && $publisher_name) {
                    $publisher = Publishers::where('name', $publisher_name)->first();
                }

                if (!$publisher && $publisher_name) {
                    $publisher = Publishers::create([
                        'name' => $publisher_name,
                        'publisher_type' => PublisherType::JOURNAL->value,
                        'is_approved' => false
                    ]);
                    $publisher->issns()->create(['issn' => $issn]);
                }

                $publisher_id = $publisher?->id;
            }

            $production = compact('home_page', 'source', 'title', 'year', 'publisher_id', 'publisher_type', 'doi', 'nature', 'sequence_number');
            $data['productions'][] = $production;
        }

        $productions = $xml->{'PRODUCAO-BIBLIOGRAFICA'}->{'TRABALHOS-EM-EVENTOS'}->{'TRABALHO-EM-EVENTOS'} ?? [];
        /** @var SimpleXMLElement $item */
        foreach ($productions as $item) {
            $doi = (string)$item->{'DADOS-BASICOS-DO-TRABALHO'}->attributes()['DOI'];
            trim($doi);
            $doi = "http://dx.doi.org/$doi";
            $title = (string)$item->{'DADOS-BASICOS-DO-TRABALHO'}->attributes()['TITULO-DO-TRABALHO'];
            error_log($title);
            $year = (string)$item->{'DADOS-BASICOS-DO-TRABALHO'}->attributes()['ANO-DO-TRABALHO'];
            $issn = (string)$item->{'DADOS-BASICOS-DO-TRABALHO'}->attributes()['ISSN'];
            $isbn = (string)$item->{'DADOS-BASICOS-DO-TRABALHO'}->attributes()['ISBN'];
            $rawHomePageData = (string)$item->{'DADOS-BASICOS-DO-TRABALHO'}->attributes()['HOME-PAGE-DO-TRABALHO'];
            $home_page = "";
            $rawHomePageData = trim($rawHomePageData);
            if (!empty($rawHomePageData)){
                // Strips [] from "[data]" and "[data1][data2]"
                $cleanContent = trim($rawHomePageData, '[]');
                if (strpos($cleanContent, '][') !== false) {
                    //If it contains multiple parts "[url][doi]", split and take the first
                    $parts = explode('][', $cleanContent);
                    $result = $parts[0];
                } else {
                    $result = $cleanContent;
                }
                $home_page = str_ireplace(['http://https://','http://http://'], 'https://', $result);
                $home_page = str_ireplace('doi:', 'http://dx.doi.org/', $home_page);
            }
            $conferenceName = (string)$item->{'DETALHAMENTO-DO-TRABALHO'}->attributes()['NOME-DO-EVENTO'];
            $nature = (string)$item->{'DADOS-BASICOS-DO-TRABALHO'}->attributes()['NATUREZA'];
            $sequence_number = (string)$item->attributes()['SEQUENCIA-PRODUCAO'];
            $publisher_id = null;
            $publisher_type = PublisherType::CONFERENCE->value;
            $source = ProductionSource::XML->value;

            if ($conferenceName) {
                $publisher_id = Publishers::whereLike('name' ,$conferenceName)->first()?->id;
                //$conferenceName === "Hawaii International Conference on System Sciences" ? error_log("Achei o havai, publisher = ". $publisher_id) : $conferenceName;
            }

            if(!$publisher_id){
                //error_log("Looking on doi api");
                //[$acronym, $name] = $loadXml->getConferenceInfoFromDOI($doi);
                $conferenceInfo = $loadXml->getConferenceInfoFromDOI($doi);
                if($conferenceInfo){
                    $acronym = $conferenceInfo['conference_acronym'];
                    $name = $conferenceInfo['conference_name'];
                    //error_log("Received from doi api:".$acronym ." - ". $name);
                    $publisher = $acronym ? Publishers::where('initials', $acronym)->first() : null;
                    if (!$publisher) {
                        //error_log("Nao encontrei pela initials");
                        $publisher = Publishers::where('name', $name)->first();
                        //$publisher ? error_log("encontrei pelo nome") : error_log("nao encontrei pelo nome");
                    }

                    if (!$publisher && ($name || $acronym)) {
                        $publisher = Publishers::create([
                            'name' => $name ?? $conferenceName,
                            'initials' => $acronym,
                            'publisher_type' => PublisherType::CONFERENCE->value,
                            'is_approved' => false
                        ]);
                    }

                    $publisher_id = $publisher?->id;
                    //error_log("publisher id = ".$publisher_id);
                } else if ($conferenceName) {
                    $publisher = Publishers::create([
                        'name' => $conferenceName,
                        'publisher_type' => PublisherType::CONFERENCE->value,
                        'is_approved' => false
                    ]);
                    $publisher_id = $publisher->id;
                }
            }

            $production = compact('home_page', 'source','title', 'year', 'publisher_id', 'publisher_type', 'doi', 'nature', 'sequence_number', 'issn', 'isbn');
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

    private function removeYear($text)
    {
        if (!$text)
            return null;

        // Remove 4-digit years (e.g., 2020)
        $text = preg_replace('/(?<!\d)(19|20)\d{2}(?!\d)/', '', $text);

        // Remove shortened years like '20
        $text = preg_replace("/'\d{2}\b/", '', $text);

        // Clean extra spaces
        return trim(preg_replace('/\s+/', ' ', $text));
    }

    function removerNumerosExtenso($texto) {

    // CARDINAIS - Português
    $cardinais_pt = [
        "zero","um","uma","dois","duas","tres","três","quatro","cinco","seis","sete",
        "oito","nove","dez","onze","doze","treze","catorze","quatorze","quinze",
        "dezesseis","dezasseis","dezessete","dezoito","dezenove",
        "vinte","trinta","quarenta","cinquenta","sessenta",
        "setenta","oitenta","noventa","cem","cento","duzentos",
        "trezentos","quatrocentos","quinhentos","seiscentos",
        "setecentos","oitocentos","novecentos","mil","milhao","milhão",
        "milhoes","milhões","bilhao","bilhão","bilhoes","bilhões"
    ];

    // ORDINAIS - Português
    $ordinais_pt = [
        "primeiro","primeira","segundo","segunda","terceiro","terceira",
        "quarto","quarta","quinto","quinta","sexto","sexta",
        "setimo","sétimo","setima","sétima","oitavo","oitava",
        "nono","nona","decimo","décimo","decima","décima",
        "vigesimo","vigésimo","vigesima","vigésima",
        "trigesimo","trigésimo","centesimo","centésimo",
        "milesimo","milésimo"
    ];

    // CARDINAIS - Inglês
    $cardinais_en = [
        "zero","one","two","three","four","five","six","seven","eight","nine",
        "ten","eleven","twelve","thirteen","fourteen","fifteen",
        "sixteen","seventeen","eighteen","nineteen",
        "twenty","thirty","forty","fifty","sixty",
        "seventy","eighty","ninety",
        "hundred","thousand","million","billion"
    ];

    // ORDINAIS - Inglês
    $ordinais_en = [
        "first","second","third","fourth","fifth","sixth","seventh",
        "eighth","ninth","tenth","eleventh","twelfth","thirteenth",
        "fourteenth","fifteenth","sixteenth","seventeenth",
        "eighteenth","nineteenth",
        "twentieth","thirtieth","fortieth","fiftieth",
        "sixtieth","seventieth","eightieth","ninetieth",
        "hundredth","thousandth","millionth","billionth"
    ];

    $periods = [
        "annual",
        "monthly",
        "estendido",
        "companion"
    ];

    //Ordinais numeros

    // Junta tudo
    $todos = array_merge(
        $cardinais_pt,
        $ordinais_pt,
        $cardinais_en,
        $ordinais_en,
        $periods
    );
    // Cria regex dinâmica
    $padrao = '/\b(' . implode('|', $todos) . ')\b/iu';

    // Remove do texto
    $texto = preg_replace($padrao, '', $texto);
    $texto = preg_replace('/\b\d+(?:st|nd|rd|th)\b/', '', $texto);

    // Remove espaços duplicados
    return trim(preg_replace('/\s+/', ' ', $texto));
}


    private function getConferenceInfoFromDOI($doi) {
        $url = "https://api.crossref.org/works/doi/{$doi}";

        try {
            $response = $this->clientHttp->get($url, ['query' => []]);
        } catch (Exception $e) {
            //throw new Exception("CrossRef API Error: " . $e->getMessage());
            return null;
        }
        //$encodedDoi = urlencode($doi);
        //error_log("got a response from doi api");
        $data = json_decode($response->getBody(), true);

        if (!isset($data['message'])) {
            return null;
        }

        $message = $data['message'];

        $conferenceName = $message['event']['name'] ?? null;
        $conferenceAcronym = $message['event']['acronym'] ?? null;

        // Remove year from both fields
        $conferenceName = $this->removeYear($conferenceName);
        $conferenceName = $this->removerNumerosExtenso($conferenceName);
        if (preg_match('/\(([^)]+)\)/', $conferenceName, $match)) {
            if(!$conferenceAcronym){
                $conferenceAcronym = $match[1];
                $conferenceName = preg_replace('/\(([^)]+)\)/', '', $conferenceName);
            }
        }
        $conferenceAcronym = $this->removeYear($conferenceAcronym);
        $conferenceAcronym = $this->removerNumerosExtenso($conferenceAcronym);

        //error_log($conferenceAcronym." - ". $conferenceName);

        return [
            'conference_name' => $conferenceName,
            'conference_acronym' => $conferenceAcronym,
        ];
}
}
