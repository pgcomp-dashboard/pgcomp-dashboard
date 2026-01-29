<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Production;
use Illuminate\Http\Request;

class RankingController extends Controller
{
    protected Production $production;
    public function index(Request $request)
    {
        // Se não especificar o periodo pega somente o ano anterior
        $year1 = $request->query("year1",date("Y") - 1);
        $year2 = $request->query("year2",date("Y"));

        //error_log($year1 . " " . $year2);

        $this->production = new Production;
        $ranking = $this->production->findProductionsUsedInRankingByYear($year1, $year2);
        if (empty($ranking)) {
            abort(400);
        } else {
            return response()->json([
                'data' => $ranking,
            ]);
        }
    }

    public function show(int $id, Request $request)
    {
        // Se não especificar o periodo pega somente o ano anterior
        $year1 = $request->query("year1", date("Y") - 1);
        $year2 = $request->query("year2", date("Y"));


        $this->production = new Production;
        $productions = $this->production->findProductionsUsedInRankingByYear($id, $year1, $year2);
        if (empty($productions)) {
            abort(400);
        } else {
            return response()->json([
                'data' => $productions,
            ]);
        }
    }
}
