<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\BaseApiResourceController;
use App\Http\Resources\PublisherResource;
use App\Models\BaseModel;
use App\Models\Publishers;
use Illuminate\Http\Request;
use App\Http\Requests\Admin\Publisher\StorePublisherRequest;
use App\Http\Requests\Admin\Publisher\UpdatePublisherRequest;
use App\Http\Requests\Admin\ImportQualisRequest;
use App\Domain\Qualis\ConferenceQualisXLSX;
use App\Domain\Qualis\JournalQualisXLSX;
use App\Enums\PublisherType;
use Illuminate\Support\Str;
use App\Models\StratumQualis;

class PublisherController extends BaseApiResourceController
{
    protected $selectColumns = [
        'publishers.id',
        'publishers.initials',
        'publishers.name',
        'publishers.publisher_type',
        'publishers.issn',
        'publishers.percentile',
        'publishers.update_date',
        'publishers.tentative_date',
        'publishers.logs',
        'publishers.stratum_qualis_id',
        'publishers.created_at',
        'publishers.updated_at',
    ];

    protected function modelClass(): string|BaseModel
    {
        return Publishers::class;
    }

    protected function resourceClass(): string
    {
        return PublisherResource::class;
    }

    public function store(StorePublisherRequest $request)
    {
        $model = $this->modelClass()::create($request->all());

        if ($resourceClass = $this->resourceClass()) {
            return new $resourceClass($model);
        }

        return $model;
    }

    public function update(UpdatePublisherRequest $request, int $id)
    {
        $model = $this->findOrFail($id);

        $model->update($request->all());

        if ($resourceClass = $this->resourceClass()) {
            return new $resourceClass($model);
        }

        return $model;
    }

    public function index(Request $request)
    {
        // Determine if we're on journals or conferences route
        $routeName = $request->route()->getName();

        if (str_contains($routeName, 'journals')) {
            $this->journalQuery();
        } else {
            $this->conferenceQuery();
        }

        $results = $this->query->paginate();

        return PublisherResource::collection($results);
    }

    public function journalQuery()
    {
        $this->query = $this->newBaseQuery()
            ->select($this->selectColumns)
            ->where('publishers.publisher_type', '=', 'journal');
    }

    public function conferenceQuery()
    {
        $this->query = $this->newBaseQuery()
            ->select($this->selectColumns)
            ->where('publishers.publisher_type', '=', 'conference');
    }

    public function conferenceByInitials(Request $request){
        $initial = $request->query('initial');
        $publisher = Publishers::where('initials', '=',$initial)->first();
        return response()->json([
                'data' => $publisher,
            ]);
    }

    public function journalByIssn(Request $request){
        $issn = $request->query('issn');
        $publisher = Publishers::where('issn', '=', Str::of($issn)->trim()->remove('-')->value())->first();
        return response()->json([
                'data' => $publisher,
            ]);
    }

    public function import(ImportQualisRequest $request)
    {
        $file = $request->file('file');
        $type = $request->input('type');
        $path = $file->store('publisher-qualis-files');

        $data = match ($type) {
            'conference' => ConferenceQualisXLSX::extractConferenceQualis($path),
            'journal' => JournalQualisXLSX::extractJournalQualis($path),
        };

        $publisherType = match ($type) {
            'conference' => PublisherType::CONFERENCE,
            'journal' => PublisherType::JOURNAL,
        };

        if (count($data) > 1) {
            foreach ($data as $row) {
                $qualisId = StratumQualis::where('type', $publisherType->value)
                    ->where('code', $row[2])
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
            return response()->json([
                "status" => 200,
                "message" => "Planilha de {$typeLabel} importada com sucesso"
            ]);
        }

        return response()->json([
            "status" => 404,
            "message" => "Erro ao processar a planilha"
        ]);
    }
}
