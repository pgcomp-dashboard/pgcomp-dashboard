<?php

namespace Tests\Feature;

use App\Models\Publishers;
use App\Enums\PublisherType;
use App\Domain\Lattes\LattesZipXml;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class PublisherLookupTest extends TestCase
{
    use DatabaseTransactions;

    public function test_journal_lookup_prioritizes_approved_and_avoids_pending_duplicates()
    {
        Storage::fake('local');

        // 1. Setup: An approved journal and a pending journal with same ISSN/Name
        $approvedJournal = Publishers::factory()->create([
            'name' => 'Approved Journal',
            'publisher_type' => PublisherType::JOURNAL->value,
            'is_approved' => true
        ]);
        $approvedJournal->issns()->create(['issn' => '11112222']);

        $pendingJournal = Publishers::factory()->create([
            'name' => 'Pending Journal',
            'publisher_type' => PublisherType::JOURNAL->value,
            'is_approved' => false
        ]);
        $pendingJournal->issns()->create(['issn' => '33334444']);

        // 2. Mock XML Content
        $xmlContent = '<?xml version="1.0" encoding="UTF-8"?>
        <CURRICULO-VITAE DATA-ATUALIZACAO="01012024" HORA-ATUALIZACAO="000000" NUMERO-IDENTIFICADOR="1234567890123456">
            <DADOS-GERAIS NOME-COMPLETO="Test User"/>
            <PRODUCAO-BIBLIOGRAFICA>
                <ARTIGOS-PUBLICADOS>
                    <ARTIGO-PUBLICADO SEQUENCIA-PRODUCAO="1">
                        <DADOS-BASICOS-DO-ARTIGO TITULO-DO-ARTIGO="Artigo 1" ANO-DO-ARTIGO="2023" NATUREZA="COMPLETO"/>
                        <DETALHAMENTO-DO-ARTIGO TITULO-DO-PERIODICO-OU-REVISTA="Approved Journal" ISSN="1111-2222"/>
                    </ARTIGO-PUBLICADO>
                    <ARTIGO-PUBLICADO SEQUENCIA-PRODUCAO="2">
                        <DADOS-BASICOS-DO-ARTIGO TITULO-DO-ARTIGO="Artigo 2" ANO-DO-ARTIGO="2023" NATUREZA="COMPLETO"/>
                        <DETALHAMENTO-DO-ARTIGO TITULO-DO-PERIODICO-OU-REVISTA="Pending Journal" ISSN="3333-4444"/>
                    </ARTIGO-PUBLICADO>
                    <ARTIGO-PUBLICADO SEQUENCIA-PRODUCAO="3">
                        <DADOS-BASICOS-DO-ARTIGO TITULO-DO-ARTIGO="Artigo 3" ANO-DO-ARTIGO="2023" NATUREZA="COMPLETO"/>
                        <DETALHAMENTO-DO-ARTIGO TITULO-DO-PERIODICO-OU-REVISTA="New Journal" ISSN="5555-6666"/>
                    </ARTIGO-PUBLICADO>
                </ARTIGOS-PUBLICADOS>
            </PRODUCAO-BIBLIOGRAFICA>
        </CURRICULO-VITAE>';

        Storage::disk('local')->put('test.xml', $xmlContent);

        // 3. Execution
        $data = LattesZipXml::extractProductions('test.xml');

        // 4. Assertions
        $this->assertCount(3, $data['productions']);

        // Prod 1: Should match Approved Journal (ID)
        $this->assertEquals($approvedJournal->id, $data['productions'][0]['publisher_id']);

        // Prod 2: Should match Pending Journal (ID) - avoiding creation of a second pending one
        $this->assertEquals($pendingJournal->id, $data['productions'][1]['publisher_id']);
        $this->assertEquals(2, Publishers::whereIn('id', [$approvedJournal->id, $pendingJournal->id])->count());

        // Prod 3: Should create a NEW pending journal
        $newJournal = Publishers::where('name', 'New Journal')->first();
        $this->assertNotNull($newJournal);
        $this->assertFalse($newJournal->is_approved);
        $this->assertEquals($newJournal->id, $data['productions'][2]['publisher_id']);
    }

    public function test_conference_lookup_prioritizes_approved_and_avoids_pending_duplicates()
    {
        Storage::fake('local');

        // 1. Setup: An approved conference and a pending one
        $approvedConf = Publishers::factory()->create([
            'name' => 'Approved Conference',
            'initials' => 'AC',
            'publisher_type' => PublisherType::CONFERENCE->value,
            'is_approved' => true
        ]);

        $pendingConf = Publishers::factory()->create([
            'name' => 'Pending Conference',
            'initials' => 'PC',
            'publisher_type' => PublisherType::CONFERENCE->value,
            'is_approved' => false
        ]);

        // 2. Mock XML Content
        $xmlContent = '<?xml version="1.0" encoding="UTF-8"?>
        <CURRICULO-VITAE DATA-ATUALIZACAO="01012024" HORA-ATUALIZACAO="000000" NUMERO-IDENTIFICADOR="1234567890123456">
            <DADOS-GERAIS NOME-COMPLETO="Test User"/>
            <PRODUCAO-BIBLIOGRAFICA>
                <TRABALHOS-EM-EVENTOS>
                    <TRABALHO-EM-EVENTOS SEQUENCIA-PRODUCAO="1">
                        <DADOS-BASICOS-DO-TRABALHO TITULO-DO-TRABALHO="Trab 1" ANO-DO-TRABALHO="2023" NATUREZA="COMPLETO" ISSN="" ISBN="" DOI=""/>
                        <DETALHAMENTO-DO-TRABALHO CLASSIFICACAO-DO-EVENTO="INTERNACIONAL" NOME-DO-EVENTO="Approved Conference (AC)"/>
                    </TRABALHO-EM-EVENTOS>
                    <TRABALHO-EM-EVENTOS SEQUENCIA-PRODUCAO="2">
                        <DADOS-BASICOS-DO-TRABALHO TITULO-DO-TRABALHO="Trab 2" ANO-DO-TRABALHO="2023" NATUREZA="COMPLETO" ISSN="" ISBN="" DOI=""/>
                        <DETALHAMENTO-DO-TRABALHO CLASSIFICACAO-DO-EVENTO="INTERNACIONAL" NOME-DO-EVENTO="Pending Conference (PC)"/>
                    </TRABALHO-EM-EVENTOS>
                    <TRABALHO-EM-EVENTOS SEQUENCIA-PRODUCAO="3">
                        <DADOS-BASICOS-DO-TRABALHO TITULO-DO-TRABALHO="Trab 3" ANO-DO-TRABALHO="2023" NATUREZA="COMPLETO" ISSN="" ISBN="" DOI=""/>
                        <DETALHAMENTO-DO-TRABALHO CLASSIFICACAO-DO-EVENTO="INTERNACIONAL" NOME-DO-EVENTO="New Conference (NC)"/>
                    </TRABALHO-EM-EVENTOS>
                </TRABALHOS-EM-EVENTOS>
            </PRODUCAO-BIBLIOGRAFICA>
        </CURRICULO-VITAE>';

        Storage::disk('local')->put('test_conf.xml', $xmlContent);

        // 3. Execution
        $data = LattesZipXml::extractProductions('test_conf.xml');

        // 4. Assertions
        $this->assertCount(3, $data['productions']);

        // Prod 1: Should match Approved Conf
        $this->assertEquals($approvedConf->id, $data['productions'][0]['publisher_id']);

        // Prod 2: Should match Pending Conf
        $this->assertEquals($pendingConf->id, $data['productions'][1]['publisher_id']);

        // Prod 3: Should create a NEW pending conf
        $newConf = Publishers::where('name', 'New Conference')->first();
        $this->assertNotNull($newConf);
        $this->assertFalse($newConf->is_approved);
        $this->assertEquals($newConf->id, $data['productions'][2]['publisher_id']);
    }
}
