<?php

namespace App\Services;

use App\Domain\Lattes\LattesZipXml;
use App\Enums\ProductionSource;
use App\Models\Production;
use App\Models\Publishers;
use App\Models\User;
use Exception;
use GuzzleHttp\Client;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Spatie\QueryBuilder\AllowedFilter;
use Spatie\QueryBuilder\QueryBuilder;

class ProductionService
{
    protected $clientHttp;

    public function __construct()
    {
        $this->clientHttp = new Client;
    }

    /**
     * Get production by DOI from Crossref.
     */
    public function createFromDoi(int $userId, string $doi, string $type)
    {
        $url = "https://api.crossref.org/works/doi/{$doi}";

        try {
            $response = $this->clientHttp->get($url, ['query' => []]);

            if ($response->getStatusCode() !== 200) {
                throw new Exception("Error fetching data for DOI: {$doi}");
            }
        } catch (Exception $e) {
            throw new Exception("CrossRef API Error: " . $e->getMessage());
        }

        $data = json_decode($response->getBody(), true);
        $message = $data['message'];
        $productionDoiUrl = 'http://dx.doi.org/'.$message['DOI'];

        $production = Production::where('doi', '=', $productionDoiUrl)->first();
        if ($production) {
            if ($this->checkOwnership($userId, $production->id)) {
                throw new Exception("Produção já cadastrada para este usuário");
            }
            $production->saveInterTable($userId);
            return [
                'production' => $production,
                'publisher_not_found' => null
            ];
        }

        $title = $message['title'][0];
        if (!empty($message['subtitle'])) {
            $title = $title . ' ' . $message['subtitle'][0];
        }

        $year = $message['published']['date-parts'][0][0];

        $publisher = null;
        $publisherName = '';

        if ($type == 'journal') {
            $publisherName = $message['container-title'][0] ?? '';
            foreach ($message['ISSN'] as $issn) {
                $publisher = Publishers::where('name', 'like', "%$publisherName%")
                    ->orWhere('issn', Str::of($issn)->trim()->remove('-')->value())
                    ->first();
                if ($publisher) {
                    break;
                }
            }
        } else {
            $publisherName = $message['event']['name'] ?? '';
            $publisher = Publishers::where('name', 'like', "%$publisherName%")->first();
        }

        $productionData = [
            'users_id' => $userId,
            'source' => ProductionSource::DOI->value,
            'title' => $title,
            'year' => $year,
            'publisher_type' => $publisher->publisher_type ?? $type,
            'publisher_id' => $publisher->id ?? null,
            'doi' => $productionDoiUrl
        ];

        $production = Production::create($productionData);
        $production->saveInterTable($userId);

        return [
            'production' => $production,
            'publisher_not_found' => !$publisher ? $publisherName : null
        ];
    }

    /**
     * Import productions from Lattes ZIP file.
     */
    public function importFromLattes(User $user, $filePath)
    {
        $data = LattesZipXml::extractProductions($filePath);
        $user->updateLattes($data);
        return $data;
    }

    /**
     * Get type counts for a specific user (professor).
     */
    public function getTypeCounts(int $userId)
    {
        return Production::ofUser($userId)
            ->selectRaw("SUM(CASE WHEN publisher_type = 'journal' THEN 1 ELSE 0 END) as journal_count")
            ->selectRaw("SUM(CASE WHEN publisher_type = 'conference' THEN 1 ELSE 0 END) as conference_count")
            ->selectRaw("COUNT(*) as total_count")
            ->first();
    }

    /**
     * Store a new production and link to user.
     */
    public function store(array $data, int $userId)
    {
        $production = Production::create($data);
        $production->saveInterTable($userId);
        return $production;
    }

    /**
     * Update a production and set source to MANUAL.
     */
    public function update(Production $production, array $data)
    {
        $production->update($data);
        $production->source = ProductionSource::MANUAL->value;
        $production->save();
        return $production;
    }

    /**
     * Delete all productions of a user.
     */
    public function deleteAllUserProductions(User $user)
    {
        $userProductions = $user->writerOf;
        $count = 0;
        foreach ($userProductions as $production) {
            if ($production->isWroteBy()->count() > 1) {
                $production->isWroteBy()->detach($user->id);
                $count++;
            } elseif ($production->delete()) {
                $count++;
            }
        }
        return $count;
    }
    /**
     * Check if a production belongs to a user.
     */
    public function checkOwnership(int $userId, int $productionId): bool
    {
        return Production::where('id', $productionId)
            ->whereHas('isWroteBy', function ($query) use ($userId) {
                $query->where('users.id', $userId);
            })
            ->exists();
    }

    /**
     * Get productions for a specific user with filters and ordering.
     */
    public function getProductionsForUser(int $userId, array $params = [])
    {
        return QueryBuilder::for(Production::ofUser($userId))
            ->withPublisherAndQualis()
            ->allowedFilters([
                AllowedFilter::partial('title'),
                AllowedFilter::partial('titulo', 'title'), // Alias for frontend
                AllowedFilter::exact('year'),
                AllowedFilter::exact('ano', 'year'), // Alias
                AllowedFilter::exact('publisher_type'),
                AllowedFilter::exact('tipo', 'publisher_type'), // Alias
                AllowedFilter::exact('source'),
                AllowedFilter::exact('origem', 'source'), // Alias
            ])
            ->allowedSorts(['title', 'year', 'created_at'])
            ->get();
    }

    /**
     * Find a production by ID for a specific user.
     */
    public function findForUser(int $userId, int $productionId): Production
    {
        return Production::ofUser($userId)
            ->where('id', $productionId)
            ->firstOrFail();
    }

    /**
     * Update a production for a specific user.
     */
    public function updateForUser(int $userId, int $productionId, array $data): Production
    {
        $production = $this->findForUser($userId, $productionId);
        return $this->update($production, $data);
    }

    /**
     * Delete a production for a specific user.
     */
    public function deleteForUser(int $userId, int $productionId): bool
    {
        $production = $this->findForUser($userId, $productionId);

        if ($production->isWroteBy()->count() > 1) {
            $production->isWroteBy()->detach($userId);
            return true;
        }

        return $production->delete();
    }
}
