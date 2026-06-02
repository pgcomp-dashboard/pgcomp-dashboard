<?php

namespace Tests\Feature;

use App\Models\Production;
use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Tests\TestCase;

class LattesImportFixTest extends TestCase
{
    use DatabaseTransactions;

    public function test_lattes_import_does_not_overwrite_productions_without_doi()
    {
        $user = User::factory()->create();

        $data = [
            'lattes_xml_uploaded_at' => now(),
            'productions' => [
                [
                    'title' => 'Production One',
                    'year' => '2023',
                    'nature' => 'COMPLETO',
                    'doi' => null,
                    'source' => 'xml',
                ],
                [
                    'title' => 'Production Two',
                    'year' => '2023',
                    'nature' => 'COMPLETO',
                    'doi' => null,
                    'source' => 'xml',
                ],
            ]
        ];

        $user->updateLattes($data);

        // Should have 2 distinct productions
        $count = Production::whereIn('title', ['Production One', 'Production Two'])->count();
        $this->assertEquals(2, $count);
        $this->assertDatabaseHas('productions', ['title' => 'Production One', 'doi' => null]);
        $this->assertDatabaseHas('productions', ['title' => 'Production Two', 'doi' => null]);
    }

    public function test_lattes_import_overwrites_same_production_by_doi()
    {
        $user = User::factory()->create();
        $doi = 'http://dx.doi.org/10.1234/test';

        $data = [
            'lattes_xml_uploaded_at' => now(),
            'productions' => [
                [
                    'title' => 'Initial Title',
                    'year' => '2023',
                    'nature' => 'COMPLETO',
                    'doi' => $doi,
                    'source' => 'xml',
                ]
            ]
        ];

        $user->updateLattes($data);

        $updateData = [
            'lattes_xml_uploaded_at' => now(),
            'productions' => [
                [
                    'title' => 'Updated Title',
                    'year' => '2023',
                    'nature' => 'COMPLETO',
                    'doi' => $doi,
                    'source' => 'xml',
                ]
            ]
        ];

        $user->updateLattes($updateData);

        // Should still have 1 production for this DOI, but with updated title
        $this->assertDatabaseHas('productions', ['title' => 'Updated Title', 'doi' => $doi]);
        $this->assertDatabaseMissing('productions', ['title' => 'Initial Title', 'doi' => $doi]);
    }

    public function test_lattes_import_overwrites_same_production_by_title_and_year_if_no_doi()
    {
        $user = User::factory()->create();

        $data = [
            'lattes_xml_uploaded_at' => now(),
            'productions' => [
                [
                    'title' => 'Same Production',
                    'year' => '2023',
                    'nature' => 'COMPLETO',
                    'doi' => null,
                    'source' => 'xml',
                ]
            ]
        ];

        $user->updateLattes($data);

        $updateData = [
            'lattes_xml_uploaded_at' => now(),
            'productions' => [
                [
                    'title' => 'Same Production',
                    'year' => '2023',
                    'nature' => 'COMPLETO',
                    'doi' => null,
                    'source' => 'xml',
                    'home_page' => 'http://example.com'
                ]
            ]
        ];

        $user->updateLattes($updateData);

        // Should still have 1 production for this title/year
        $count = Production::where('title', 'Same Production')->where('year', 2023)->count();
        $this->assertEquals(1, $count);
        $this->assertDatabaseHas('productions', ['title' => 'Same Production', 'home_page' => 'http://example.com']);
    }

    public function test_lattes_import_handles_empty_doi_prefix_safety_case()
    {
        $user = User::factory()->create();

        $data = [
            'lattes_xml_uploaded_at' => now(),
            'productions' => [
                [
                    'title' => 'Production One',
                    'year' => '2023',
                    'nature' => 'COMPLETO',
                    'doi' => 'http://dx.doi.org/',
                    'source' => 'xml',
                ],
                [
                    'title' => 'Production Two',
                    'year' => '2023',
                    'nature' => 'COMPLETO',
                    'doi' => 'http://dx.doi.org/',
                    'source' => 'xml',
                ],
            ]
        ];

        $user->updateLattes($data);

        // Should have 2 distinct productions because 'http://dx.doi.org/' is treated as null
        $count = Production::whereIn('title', ['Production One', 'Production Two'])->count();
        $this->assertEquals(2, $count);
    }
}
