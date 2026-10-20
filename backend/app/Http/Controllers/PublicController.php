<?php

namespace App\Http\Controllers;

use App\Http\Resources\PublicAwardResource;
use App\Http\Resources\PublicInternationalizationActionResource;
use App\Models\Award;
use App\Models\InternationalizationAction;

/**
 * Listagens abertas, para quem não está logado. Somente leitura.
 */
class PublicController extends Controller
{
    public function awards()
    {
        $awards = Award::with('category', 'winners')
            ->orderByDesc('year')
            ->orderByDesc('id')
            ->get();

        return PublicAwardResource::collection($awards);
    }

    public function internationalization()
    {
        $actions = InternationalizationAction::with('category')
            ->orderByDesc('start_date')
            ->orderByDesc('id')
            ->get();

        return PublicInternationalizationActionResource::collection($actions);
    }
}
