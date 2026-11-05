<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\DefenseRequestResource;
use App\Models\DefenseRequest;

/** POC: a coordenação vê todas as solicitações de banca (somente leitura). */
class DefenseRequestController extends Controller
{
    public function index()
    {
        return DefenseRequestResource::collection(
            DefenseRequest::with(['user', 'advisor'])->orderByDesc('id')->get()
        );
    }
}
