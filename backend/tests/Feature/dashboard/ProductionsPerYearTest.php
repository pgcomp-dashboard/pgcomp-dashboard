<?php

namespace Tests\Unit;

use Tests\TestCase;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Testing\Fluent\AssertableJson;

class ProductionsTest extends TestCase
{

    use DatabaseTransactions;


    /**
     * @dataProvider userTypesProvider
     */
    public function test_list_docent_syntax_for_each_user_type(string $userType)
    {
        $response = $this->getJson('/api/dashboard/all_production?user_type=' . $userType);
        $response->assertStatus(200);
        $response->assertJson(
            fn(AssertableJson $json) =>
            $json->hasAll(['years', 'data'])
                ->whereAllType([
                    'years.0' => 'integer',
                    'data.0'  => 'integer',
                ])
        );


        $responseData = $response->json();
        $this->assertNotEmpty($responseData['years'], 'years empty');
        $this->assertNotEmpty($responseData['data'], 'data empty');
        $this->assertCount(
            count($responseData['years']),
            $responseData['data'],
            'Years lenth and data lenth is different.'
        );
    }

    public static function userTypesProvider(): array
    {
        return [
            ['docente'],
            ['mestrando'],
            ['doutorando'],
        ];
    }
}


