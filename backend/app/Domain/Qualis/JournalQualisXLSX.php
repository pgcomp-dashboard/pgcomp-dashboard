<?php

namespace App\Domain\Qualis;

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

class JournalQualisXLSX
{
    protected function __construct(protected string $storagePath)
    {
    }


    /**
     * @throws Exception
     */
    private function extractXmlFromZip(): ?string
    {
        $conferenceFile = 'Domain/Qualis/09012022_CLASSIFICACAODEEVENTOSPARA20172020.xlsx';
        $journalFile = 'Domain/Qualis/classificacoes_publicadas_ciencia_da_computacao_2022_1721678829186.xlsx';
        $tempDir = 'Domain/Qualis/Extracted';

        $zip = new ZipArchive();
        if (!$zip->open(app_path($conferenceFile))) {
            throw new Exception('Invalid file.');
        }
        $zip->extractTo($tempDir);
        $strings = simplexml_load_file($tempDir . '/xl/sharedStrings.xml');
        $sheet   = simplexml_load_file($tempDir . '/xl/worksheets/sheet1.xml');
        $xlrows = $sheet->sheetData->row;

        $zip->close();
        if (empty($file)) {
            throw new Exception('curriculo.xml not found in zip file.');
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
