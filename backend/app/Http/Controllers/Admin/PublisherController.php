<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\BaseApiResourceController;
use App\Http\Controllers\Controller;
use App\Http\Resources\ConferenceResource;
use App\Http\Resources\JournalResource;
use App\Http\Resources\PublisherResource;
use App\Models\BaseModel;
use App\Models\Publishers;
use Illuminate\Http\Request;
use App\Http\Requests\Api\BaseResourceIndexRequest;
use App\Http\Requests\Admin\Publisher\StorePublisherRequest;
use App\Http\Requests\Admin\Publisher\UpdatePublisherRequest;
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
        $model = $this->publisherService->create($request->all());

        return new PublisherResource($model);
    }

    public function update(UpdatePublisherRequest $request, int $id)
    {
        $model = $this->publisherService->update($id, $request->all());

        return new PublisherResource($model);
    }

    public function index(BaseResourceIndexRequest $request)
    {
        $results = $this->publisherService->listAll($request->validated());
        return PublisherResource::collection($results);
    }

    public function conferenceByInitials(Request $request){
        $initial = $request->query('initial');
        $publisher = $this->publisherService->findByInitials($initial);
        return response()->json([
                'data' => $publisher,
            ]);
    }

    public function journalByIssn(Request $request){
        $issn = $request->query('issn');
        $publisher = $this->publisherService->findByIssn($issn);
        return response()->json([
                'data' => $publisher,
            ]);
    }

    public function destroy(int $id)
    {
        $this->publisherService->delete($id);

        return response()->json(['message' => 'Publisher deleted successfully']);
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
}
