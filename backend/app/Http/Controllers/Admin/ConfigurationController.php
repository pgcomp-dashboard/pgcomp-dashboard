<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\Configuration\StoreConfigurationRequest;
use App\Http\Requests\Admin\Configuration\UpdateConfigurationRequest;
use App\Http\Resources\ConfigurationResource;
use App\Services\ConfigurationService;
use App\Models\Configuration;
use Illuminate\Http\Response;

class ConfigurationController extends Controller
{
    protected $service;

    public function __construct(ConfigurationService $service)
    {
        $this->service = $service;
    }

    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Resources\Json\AnonymousResourceCollection
     */
    public function index()
    {
        return ConfigurationResource::collection($this->service->all());
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  StoreConfigurationRequest  $request
     * @return ConfigurationResource
     */
    public function store(StoreConfigurationRequest $request)
    {
        $config = $this->service->set($request->validated());

        return new ConfigurationResource($config);
    }

    /**
     * Display the specified resource.
     *
     * @param  Configuration  $configuration
     * @return ConfigurationResource
     */
    public function show(Configuration $configuration)
    {
        return new ConfigurationResource($configuration);
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  UpdateConfigurationRequest  $request
     * @param  Configuration  $configuration
     * @return ConfigurationResource
     */
    public function update(UpdateConfigurationRequest $request, Configuration $configuration)
    {
        $data = array_merge($request->validated(), [
            'group' => $configuration->group,
            'key' => $configuration->key,
        ]);

        $config = $this->service->set($data);

        return new ConfigurationResource($config);
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  Configuration  $configuration
     * @return Response
     */
    public function destroy(Configuration $configuration)
    {
        $this->service->delete($configuration);

        return response()->noContent();
    }
}
