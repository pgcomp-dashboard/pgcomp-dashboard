<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\SystemFunctionService;
use Illuminate\Http\Request;

class SystemFunctionController extends Controller
{
    public function __construct(private SystemFunctionService $systemFunctionService)
    {
    }

    public function index()
    {
        return response()->json([
            'data' => [
                [
                    'key' => SystemFunctionService::LATTES_XML_UPLOAD_KEY,
                    'name' => 'Envio de XML Lattes por discentes',
                    'description' => 'Permite que usuários discentes enviem o XML do Lattes.',
                    'enabled' => $this->systemFunctionService->isLattesXmlUploadEnabled(),
                ],
            ],
        ]);
    }

    public function updateLattesXmlUpload(Request $request)
    {
        $validated = $request->validate([
            'enabled' => ['required', 'boolean'],
        ]);

        $this->systemFunctionService->setLattesXmlUploadEnabled(
            (bool) $validated['enabled'],
        );

        return response()->json([
            'data' => [
                'key' => SystemFunctionService::LATTES_XML_UPLOAD_KEY,
                'name' => 'Envio de XML Lattes por discentes',
                'description' => 'Permite que usuários discentes enviem o XML do Lattes.',
                'enabled' => $this->systemFunctionService->isLattesXmlUploadEnabled(),
            ],
        ]);
    }

    public function lattesXmlUploadStatus()
    {
        return response()->json([
            'enabled' => $this->systemFunctionService->isLattesXmlUploadEnabled(),
        ]);
    }
}
