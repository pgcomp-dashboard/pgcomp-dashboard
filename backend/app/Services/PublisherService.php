<?php

namespace App\Services;

use App\Domain\Qualis\ConferenceQualisXLSX;
use App\Domain\Qualis\JournalQualisXLSX;
use App\Enums\PublisherType;
use App\Models\Publishers;
use App\Models\StratumQualis;

use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Str;
use Spatie\QueryBuilder\AllowedFilter;
use Spatie\QueryBuilder\QueryBuilder;

class PublisherService
{


    /**
     * Create a new publisher.
     *
     * @param array $data
     * @return Publishers
     */
    public function create(array $data): Publishers
    {
        return Publishers::create($data);
    }

    /**
     * Find a publisher by ID.
     *
     * @param int $id
     * @return Publishers
     */
    public function find(int $id): Publishers
    {
        return Publishers::findOrFail($id);
    }




    /**
     * Update a publisher.
     *
     * @param int $id
     * @param array $data
     * @return Publishers
     */
    public function update(int $id, array $data): Publishers
    {
        $publisher = Publishers::findOrFail($id);
        $publisher->update($data);

        return $publisher;
    }

    /**
     * Delete a publisher.
     *
     * @param int $id
     * @return bool|null
     */
    public function delete(int $id): ?bool
    {
        $publisher = Publishers::findOrFail($id);
        return $publisher->delete();
    }

    public function findByInitials(string $initials): ?Publishers
    {
        return Publishers::where('initials', '=', $initials)->first();
    }

    public function findByIssn(string $issn): ?Publishers
    {
        return Publishers::where('issn', '=', Str::of($issn)->trim()->remove('-')->value())->first();
    }

    public function listAll(array $params = []): LengthAwarePaginator
    {
        return QueryBuilder::for(Publishers::class)
            ->with('stratumQualis')
            ->allowedFilters([
                'name', 'initials', 'issn', 'publisher_type', 'stratum_qualis_id',
                AllowedFilter::callback('qualis_code', function ($query, $value) {
                    $query->whereHas('stratumQualis', function($q) use ($value) {
                        $q->where('code', $value);
                    });
                })
            ])
            ->allowedSorts(['name', 'initials', 'issn', 'publisher_type', 'stratum_qualis_id', 'qualis_code'])
            ->paginate($params['per_page'] ?? 15);
    }

    public function importQualis(string $type, string $filePath): array
    {
        $data = match ($type) {
            'conference' => ConferenceQualisXLSX::extractConferenceQualis($filePath),
            'journal' => JournalQualisXLSX::extractJournalQualis($filePath),
        };

        $publisherType = match ($type) {
            'conference' => PublisherType::CONFERENCE,
            'journal' => PublisherType::JOURNAL,
        };

        if (count($data) > 1) {
            foreach ($data as $row) {
                // Determine code based on type
                $code = $row[2];

                $qualisId = StratumQualis::where('type', $publisherType->value)
                    ->where('code', $code)
                    ->first()->id ?? null;

                if ($type === 'conference') {
                    Publishers::updateOrCreate(
                        [
                            'initials' => $row[0],
                            'name' => $row[1]
                        ],
                        [
                            'initials' => $row[0],
                            'name' => $row[1],
                            'stratum_qualis_id' => $qualisId,
                            'publisher_type' => $publisherType->value
                        ]
                    );
                } else {
                    $issn = Str::of($row[0])->trim()->remove('-')->value();
                    Publishers::updateOrCreate(
                        [
                            'issn' => $issn,
                            'name' => $row[1]
                        ],
                        [
                            'issn' => $issn,
                            'name' => $row[1],
                            'stratum_qualis_id' => $qualisId,
                            'publisher_type' => $publisherType->value
                        ]
                    );
                }
            }

            $typeLabel = $type === 'conference' ? 'Conferências' : 'Revistas';
            return [
                "status" => 200,
                "message" => "Planilha de {$typeLabel} importada com sucesso"
            ];
        }

        return [
            "status" => 404,
            "message" => "Erro ao processar a planilha"
        ];
    }
}
