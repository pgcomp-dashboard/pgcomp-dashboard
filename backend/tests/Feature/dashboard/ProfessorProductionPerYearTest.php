<?php

namespace Tests\Feature\Dashboard;

use Illuminate\Foundation\Testing\DatabaseTransactions;
use Tests\TestCase;

class ProfessorProductionsPerYearTest extends TestCase
{
    use DatabaseTransactions;

    public function test_all_professors_productions_per_year_range_and_types()
    {
        $start = 2020;
        $end = 2025;

        $profResponse = $this->getJson('/api/dashboard/professors');
        $profResponse->assertStatus(200);
        $professors = $profResponse->json('data');

        $issues = [];

        foreach ($professors as $prof) {
            $id = $prof['id'];
            $name = $prof['name'];

            $res = $this->getJson("/api/dashboard/professor/{$id}/productions?anoInicial={$start}&anoFinal={$end}");
            if ($res->getStatusCode() !== 200) {
                $issues[] = "Falha HTTP para {$name} (ID {$id}): status {$res->getStatusCode()}";

                continue;
            }

            $productions = $payload['productions'] ?? [];

            if (! is_array($productions)) {
                $issues[] = "Campo 'productions' não é array para {$name} (ID {$id})";

                continue;
            }

            foreach ($productions as $yearStr => $count) {
                if (! preg_match('/^\d{4}$/', $yearStr)) {
                    $issues[] = "Chave de ano inválida para {$name} (ID {$id}): '{$yearStr}'";

                    continue;
                }

                $year = (int) $yearStr;
                if ($year < $start || $year > $end) {
                    $issues[] = "Ano fora do intervalo para {$name} (ID {$id}): retornou {$yearStr}";
                }

                if (! is_int($count)) {
                    $val = is_scalar($count) ? $count : json_encode($count);
                    $issues[] = "Valor não é inteiro para {$name} (ID {$id}), ano {$yearStr}: retornou {$val}";
                }
            }
        }

        if (! empty($issues)) {
            $this->fail(
                "Foram encontrados problemas nos endpoints de produções por professor:\n".
                    implode("\n", $issues)
            );
        }

        $this->assertTrue(true);
    }
}
