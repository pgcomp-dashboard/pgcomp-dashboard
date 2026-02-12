<?php

namespace App\Services;

use App\Domain\Qualis\ConferenceQualisXLSX;
use App\Domain\Qualis\JournalQualisXLSX;
use App\Enums\PublisherType;
use App\Models\Publishers;
use App\Models\StratumQualis;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Str;

class PublisherService
{
    /**
     * List all journals with pagination.
     *
     * @param int $perPage
     * @return LengthAwarePaginator
     */
    public function listJournals(int $perPage = 15): LengthAwarePaginator
    {
        return Publishers::onlyJournals()->paginate($perPage);
    }

    /**
     * List all conferences with pagination.
     *
     * @param int $perPage
     * @return LengthAwarePaginator
     */
    public function listConferences(int $perPage = 15): LengthAwarePaginator
    {
        return Publishers::onlyConferences()->paginate($perPage);
    }

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
     * Find a journal by ID.
     *
     * @param int $id
     * @return Publishers
     */
    public function findJournal(int $id): Publishers
    {
        return Publishers::onlyJournals()->findOrFail($id);
    }

    /**
     * Find a conference by ID.
     *
     * @param int $id
     * @return Publishers
     */
    public function findConference(int $id): Publishers
    {
        return Publishers::onlyConferences()->findOrFail($id);
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

    public function listAll(int $perPage = 15): LengthAwarePaginator
    {
        return Publishers::query()->paginate($perPage);
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
