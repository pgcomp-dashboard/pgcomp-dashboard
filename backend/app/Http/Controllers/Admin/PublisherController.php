<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\PublisherResource;
use App\Models\Publishers;
use Illuminate\Http\Request;
use App\Http\Requests\Admin\Publisher\StorePublisherRequest;
use App\Http\Requests\Admin\Publisher\UpdatePublisherRequest;
use App\Http\Requests\Admin\Publisher\IndexPublisherRequest;
use App\Http\Requests\Admin\ImportQualisRequest;
use App\Domain\Qualis\ConferenceQualisXLSX;
use App\Domain\Qualis\JournalQualisXLSX;
use App\Enums\PublisherType;
use Illuminate\Support\Str;
use App\Models\StratumQualis;
use App\Services\PublisherService;

class PublisherController extends Controller
{
    private PublisherService $publisherService;

    public function __construct(PublisherService $publisherService)
    {
        $this->publisherService = $publisherService;
    }

    public function store(StorePublisherRequest $request)
    {
        $data = $request->all();
        // Only approve if has qualis classification
        $data['is_approved'] = !empty($data['stratum_qualis_id']);

        $model = $this->publisherService->create($data);

        return new PublisherResource($model);
    }

    public function update(UpdatePublisherRequest $request, int $id)
    {
        $model = $this->publisherService->update($id, $request->all());

        return new PublisherResource($model);
    }

    public function show(int $id)
    {
        $publisher = $this->publisherService->find($id);
        return new PublisherResource($publisher);
    }

    public function index(IndexPublisherRequest $request)
    {
        $results = $this->publisherService->listAll($request->validated());
        return PublisherResource::collection($results);
    }

    public function conferenceByInitials(Request $request){
        $initial = $request->query('initial');
        $publisher = $this->publisherService->findByInitials($initial);
        return new PublisherResource($publisher);
    }

    public function journalByIssn(Request $request){
        $issn = $request->query('issn');
        $publisher = $this->publisherService->findByIssn($issn);
        return new PublisherResource($publisher);
    }

    public function destroy(int $id)
    {
        $this->publisherService->delete($id);

        return response()->json(['message' => 'Publisher deleted successfully']);
    }

    public function approve(int $id)
    {
        $publisher = $this->publisherService->find($id);

        if (is_null($publisher->stratum_qualis_id)) {
            return response()->json([
                'message' => 'Não é possível aprovar um veículo sem classificação Qualis. Por favor, atribua uma classificação Qualis primeiro.',
                'error' => 'missing_qualis',
            ], 422);
        }

        $publisher->update(['is_approved' => true]);

        return response()->json([
            'message' => 'Veículo aprovado com sucesso.',
            'is_approved' => true,
        ]);
    }

    public function import(ImportQualisRequest $request)
    {
        $file = $request->file('file');
        $type = $request->input('type');
        $path = $file->store('publisher-qualis-files');

        $result = $this->publisherService->importQualis($type, $path);

        if ($result['status'] === 200) {
            return response()->json($result);
        }

        return response()->json($result);
    }

    public function destroyAllPending()
    {
        $this->publisherService->destroyAllPending();

        return response()->json(['message' => 'All pending publishers deleted successfully']);
    }
}
