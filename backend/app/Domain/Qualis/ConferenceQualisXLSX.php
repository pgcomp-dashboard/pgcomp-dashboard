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
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use SimpleXMLElement;
use Str;
use ZipArchive;

class ConferenceQualisXLSX
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
    public static function extractConferenceQualis(string $storagePath): array
    {
        $loadXml = new static($storagePath);
        $file = $loadXml->loadFile();


        return $file;
    }

    /**
     * @throws InvalidXml
     * @throws Exception
     */
    private function loadFile()
    {
        $mimeType = Storage::mimeType($this->storagePath);
        if ($mimeType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
            $data = $this->extractXmlFromZip();
        } else {
            throw new Exception("Invalid MIME type {$mimeType}.");
        }
        //$this->validate($file);

        return $data;
    }

    /**
     * @throws Exception
     */
    private function extractXmlFromZip()
    {
        $dir = app_path('Domain/Qualis/Extracted');
        $zip = new ZipArchive();
        if (!$zip->open(Storage::path($this->storagePath))) {
            throw new Exception('Invalid Zip file.');
        }
        $zip->extractTo($dir);
        $strings = simplexml_load_file($dir . '/xl/sharedStrings.xml');
        $sheet   = simplexml_load_file($dir . '/xl/worksheets/sheet1.xml');

        $rows = $sheet->sheetData->row;

        $data = array();

        foreach ($rows as $row) {
            $arr = array();

            foreach ($row->c as $cell) {
                $v = (string) $cell->v;

                if (isset($cell['t']) && $cell['t'] == 's') {
                    $s = array();
                    $si = $strings->si[(int) $v];

                    // Register & alias the default namespace or you'll get empty results in the xpath query
                    $si->registerXPathNamespace('n', 'http://schemas.openxmlformats.org/spreadsheetml/2006/main');

                    // Cat together all of the 't' (text?) node values
                    foreach ($si->xpath('.//n:t') as $t) {
                        $s[] = (string) $t;
                    }

                    $v = implode($s);
                }
                $arr[] = $v;
            }
            array_push($data,$arr);
            //error_log(implode($arr));
        }
        array_splice($data, 0, 1);
        return $data;
    }
}
