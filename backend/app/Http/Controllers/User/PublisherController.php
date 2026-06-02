<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Http\Resources\PublisherResource;
use App\Http\Requests\Admin\Publisher\StorePublisherRequest; // Reusing admin request for validation
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
        $data = $request->validated();
        $data['is_approved'] = false; // Regular users submit publishers as pending

        $model = $this->publisherService->create($data);

        return new PublisherResource($model);
    }
}
