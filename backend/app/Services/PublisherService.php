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
        $publisher = Publishers::create($data);
        if (isset($data['issns']) && is_array($data['issns'])) {
            $issnData = collect($data['issns'])
                ->filter()
                ->map(fn($issn) => ['issn' => $issn])
                ->toArray();
            if (count($issnData) > 0) {
                $publisher->issns()->createMany($issnData);
            }
        }
        return $publisher;
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

        // Recalculate is_approved based on stratum_qualis_id
        $hasQualis = !is_null($publisher->stratum_qualis_id);
        if ($publisher->is_approved !== $hasQualis) {
            $publisher->update(['is_approved' => $hasQualis]);
        }

        if (array_key_exists('issns', $data) && is_array($data['issns'])) {
            $publisher->issns()->delete();
            $issnData = collect($data['issns'])
                ->filter()
                ->map(fn($issn) => ['issn' => $issn])
                ->toArray();
            if (count($issnData) > 0) {
                $publisher->issns()->createMany($issnData);
            }
        }

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

    /**
     * Delete all pending (not approved) publishers.
     *
     * @return void
     */
    public function destroyAllPending(): void
    {
        Publishers::onlyPending()->delete();
    }

    public function findByInitials(string $initials): ?Publishers
    {
        return Publishers::where('initials', '=', $initials)->first();
    }

    public function findByIssn(string $issn): ?Publishers
    {
        $cleanIssn = Str::of($issn)->trim()->remove('-')->value();
        return Publishers::whereHas('issns', function($q) use ($cleanIssn) {
            $q->where('issn', '=', $cleanIssn);
        })->first();
    }

    public function listAll(array $params = []): LengthAwarePaginator
    {
        return QueryBuilder::for(Publishers::class)
            ->with(['stratumQualis', 'issns'])
            ->allowedFilters([
                'name', 'initials', 'publisher_type', 'stratum_qualis_id', 'is_approved',
                AllowedFilter::callback('status', function ($query, $value) {
                    if ($value === 'approved') {
                        $query->where('is_approved', true);
                    } elseif ($value === 'pending') {
                        $query->where('is_approved', false);
                    }
                }),
                AllowedFilter::callback('issn', function ($query, $value) {
                    $query->whereHas('issns', function($q) use ($value) {
                        $q->where('issn', 'like', "%{$value}%");
                    });
                }),
                AllowedFilter::callback('search', function ($query, $value) {
                    $query->where(function ($q) use ($value) {
                        $q->where('name', 'like', "%{$value}%")
                          ->orWhere('initials', 'like', "%{$value}%")
                          ->orWhereHas('issns', function ($issnQ) use ($value) {
                              $issnQ->where('issn', 'like', "%{$value}%");
                          });
                    });
                }),
                AllowedFilter::callback('qualis_code', function ($query, $value) {
                    $query->whereHas('stratumQualis', function($q) use ($value) {
                        $q->where('code', $value);
                    });
                })
            ])
            ->allowedSorts(['name', 'initials', 'publisher_type', 'stratum_qualis_id', 'qualis_code'])
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
                            'publisher_type' => $publisherType->value,
                            'is_approved' => true
                        ]
                    );
                } else {
                    $issn = Str::of($row[0])->trim()->remove('-')->value();

                    $publisher = Publishers::whereHas('issns', function($q) use ($issn) {
                        $q->where('issn', $issn);
                    })->first();

                    if (!$publisher) {
                        $publisher = Publishers::where('name', $row[1])->first();
                    }

                    if ($publisher) {
                        $publisher->update([
                            'name' => $row[1],
                            'stratum_qualis_id' => $qualisId,
                            'publisher_type' => $publisherType->value,
                            'is_approved' => true
                        ]);
                        $publisher->issns()->firstOrCreate(['issn' => $issn]);
                    } else {
                        $publisher = Publishers::create([
                            'name' => $row[1],
                            'stratum_qualis_id' => $qualisId,
                            'publisher_type' => $publisherType->value,
                            'is_approved' => true
                        ]);
                        $publisher->issns()->create(['issn' => $issn]);
                    }
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
