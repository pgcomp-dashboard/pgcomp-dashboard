<?php

namespace Tests\Unit;

use App\Models\Publishers;
use App\Services\PublisherService;
use Tests\TestCase;

class PublisherServiceTest extends TestCase
{
    public function test_prefers_approved_publisher_by_acronym_or_name()
    {
        $service = app(PublisherService::class);

        $approved = Publishers::create([
            'initials' => 'SBRC',
            'name' => 'Simpósio Brasileiro de Redes de Computadores',
            'publisher_type' => 'conference',
            'is_approved' => true,
        ]);

        $result = $service->findPublisherByConferenceName('SBRC - Simpósio Brasileiro de Redes de Computadores 2023', true);

        $this->assertNotNull($result);
        $this->assertEquals($approved->id, $result->id);
    }

    public function test_falls_back_to_pending_when_onlyApproved_false()
    {
        $service = app(PublisherService::class);

        $pending = Publishers::create([
            'initials' => null,
            'name' => 'Toy Conference',
            'publisher_type' => 'conference',
            'is_approved' => false,
        ]);

        $result = $service->findPublisherByConferenceName('Toy Conference', false);

        $this->assertNotNull($result);
        $this->assertEquals($pending->id, $result->id);
    }

    public function test_excluded_term_suppresses_acronym_matching()
    {
        $service = app(PublisherService::class);

        Publishers::create([
            'initials' => 'SBRC',
            'name' => 'Simpósio Brasileiro de Redes de Computadores',
            'publisher_type' => 'conference',
            'is_approved' => true,
        ]);

        $result = $service->findPublisherByConferenceName('WORKSHOP DE COMPUTAÇÃO - SBRC', true);

        $this->assertNull($result);
    }

    public function test_acronym_as_conference_name_matches_initials()
    {
        $service = app(PublisherService::class);

        $approved = Publishers::create([
            'initials' => 'SBISI',
            'name' => 'Brazilian Symposium on Information Systems',
            'publisher_type' => 'conference',
            'is_approved' => true,
        ]);

        $result = $service->findPublisherByConferenceName('SBISI', true);

        $this->assertNotNull($result);
        $this->assertEquals($approved->id, $result->id);
    }

    public function test_ordinal_prefix_in_name_is_removed_before_search()
    {
        $service = app(PublisherService::class);

        $approved = Publishers::create([
            'initials' => null,
            'name' => 'Simpósio Brasileiro de Redes de Computadores',
            'publisher_type' => 'conference',
            'is_approved' => true,
        ]);

        $result = $service->findPublisherByConferenceName('XXXVI Simpósio Brasileiro de Redes de Computadores', true);

        $this->assertNotNull($result);
        $this->assertEquals($approved->id, $result->id);
    }

    public function test_name_with_punctuation_matches_after_normalization()
    {
        $service = app(PublisherService::class);

        $approved = Publishers::create([
            'initials' => null,
            'name' => "american scientific research journal for engineering, technology, and sciences",
            'publisher_type' => 'conference',
            'is_approved' => true,
        ]);

        $result = $service->findPublisherByConferenceName('american scientific research journal for engineering , technology , and sciences', true);

        $this->assertNotNull($result);
        $this->assertEquals($approved->id, $result->id);
    }

    public function test_numeric_ordinal_prefix_is_removed()
    {
        $service = app(PublisherService::class);

        $approved = Publishers::create([
            'initials' => null,
            'name' => 'Conference of Widgets',
            'publisher_type' => 'conference',
            'is_approved' => true,
        ]);

        $result = $service->findPublisherByConferenceName('36º Conference of Widgets', true);

        $this->assertNotNull($result);
        $this->assertEquals($approved->id, $result->id);
    }

    public function test_returns_null_when_conference_name_is_empty_string()
    {
        $service = app(PublisherService::class);

        Publishers::create([
            'initials' => null,
            'name' => 'Conference of Widgets',
            'publisher_type' => 'conference',
            'is_approved' => true,
        ]);

        $resultEmpty = $service->findPublisherByConferenceName('', true);
        $resultSpaces = $service->findPublisherByConferenceName('   ', true);

        $this->assertNull($resultEmpty);
        $this->assertNull($resultSpaces);
    }

}
