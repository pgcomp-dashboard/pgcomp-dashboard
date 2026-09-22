<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\Admin\StudentRankingResource;
use App\Services\Admin\StudentRankingService;
use Illuminate\Http\Request;

class StudentRankingController extends Controller
{
    public function __construct(private StudentRankingService $studentRankingService)
    {
    }

    public function index(Request $request)
    {
        return StudentRankingResource::collection(
            $this->studentRankingService->getRanking(
                $request->query('year1'),
                $request->query('year2'),
                $request->filled('course_id') ? (int) $request->query('course_id') : null,
                min(max((int) $request->query('per_page', 15), 1), 100),
                max((int) $request->query('page', 1), 1),
                (string) $request->query('sort', 'position'),
                (string) $request->query('direction', 'desc'),
            )
        );
    }
}
