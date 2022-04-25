<?php

namespace App\Models;

use Eloquent;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

/**
 * App\Models\StratumQualis
 *
 * @property int $id
 * @property string $code
 * @property int $score
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @method static Builder|StratumQualis newModelQuery()
 * @method static Builder|StratumQualis newQuery()
 * @method static Builder|StratumQualis query()
 * @method static Builder|StratumQualis whereCode($value)
 * @method static Builder|StratumQualis whereCreatedAt($value)
 * @method static Builder|StratumQualis whereId($value)
 * @method static Builder|StratumQualis whereScore($value)
 * @method static Builder|StratumQualis whereUpdatedAt($value)
 * @mixin Eloquent
 */
class StratumQualis extends BaseModel
{
    use HasFactory;

    protected $fillable = [
        'code',
        'score',
    ];

    public static function creationRules(): array
    {
        return [
            'code' => 'required|string|max:2',
            'score' => 'required|int',
        ];
    }

    public static function findByCode(string $code, array $columns = ['*']): self
    {
        return self::where('code', $code)->firstOrFail($columns);
    }

    public function updateRules(): array
    {
        return [
            'code' => 'string|max:2',
            'score' => 'int',
        ];
    }

    public function totalProductionsPerQualis($pattern): array
    {
        $totalOfStratum = DB::table('stratum_qualis')
            ->select(DB::raw('distinct stratum_qualis.id'))
            ->get();
        $totalOfStratum = count($totalOfStratum);

        $years = DB::table('productions')
            ->select(DB::raw('min(productions.year) as min, max(productions.year) as max'))
            ->get();

        $stratumLabels = StratumQualis::all('code');
        $stratumProductions = array();

        // jornals_id || publisher_id (Olhar depois)
        for ($nStratum = 1; $nStratum <= $totalOfStratum; $nStratum++) {
            $data = DB::table('productions')
                ->select(DB::raw('productions.year, count(distinct productions.id) as total'))
                ->join('journals', 'productions.publisher_id', '=', 'journals.id')
                ->join('stratum_qualis', 'journals.stratum_qualis_id','=', 'stratum_qualis.id')
                ->where('stratum_qualis.id', '=', $nStratum)
                ->groupBy('productions.year', 'stratum_qualis.id')
                ->get();
            $stratumProductions[$nStratum] = $data;
        }

        $data = array();
        $allYears = array();
        for($year = $years[0]->min; $year <= $years[0]->max; $year++){
            $allYears[] = $year;
        }

        for($nStratum = 1; $nStratum <= $totalOfStratum; $nStratum++) {
            $auxData = $stratumProductions[$nStratum];
            $newTempData = array();
            $countIterations = 0;
            $dataSize = count($auxData);

            for($year = $years[0]->min; $year <= $years[0]->max; $year++){
                if($countIterations < $dataSize &&
                    $auxData[$countIterations]->year == $year)
                {
                    $newTempData[] = $auxData[$countIterations]->total;
                    $countIterations++;
                }else{
                    $newTempData[] = 0;
                }
            }
            $data[$nStratum-1] = $newTempData;
        }

        $dataWithLabels = array();
        for($nStratum = 1; $nStratum <= $totalOfStratum; $nStratum++) {
            $dataWithLabels[] = ['label' => $stratumLabels[$nStratum - 1]->code, 'data' => $data[$nStratum - 1]];
        }
        return [$pattern[0] => $allYears, $pattern[1] => $dataWithLabels];
    }

    public function ProductionsPerQualisFilterMaster($pattern): array
    {
        $totalOfStratum = DB::table('stratum_qualis')
            ->select(DB::raw('distinct stratum_qualis.id'))
            ->get();
        $totalOfStratum = count($totalOfStratum);

        $years = DB::table('productions')
            ->select(DB::raw('min(productions.year) as min, max(productions.year) as max'))
            ->get();

        $stratumLabels = StratumQualis::all('code');
        $stratumProductions = array();

        // jornals_id || publisher_id (Olhar depois)
        for($nStratum = 1; $nStratum <= $totalOfStratum; $nStratum++) {
            $data = DB::table('productions')
                ->select(DB::raw('productions.year, count(distinct productions.id) as total'))
                ->join('journals', 'productions.publisher_id', '=', 'journals.id')
                ->join('stratum_qualis', 'journals.stratum_qualis_id','=', 'stratum_qualis.id')
                ->join('users_productions', 'productions.id', '=', 'users_productions.productions_id')
                ->join('users', 'users_productions.users_id', '=', 'users.id')
                ->where('users.course_id', '=', 1)
                ->where('stratum_qualis.id', '=', $nStratum)
                ->groupBy('productions.year', 'stratum_qualis.id')
                ->get();
            $stratumProductions[$nStratum] = $data;
        }

        $data = array();
        $allYears = array();
        for($year = $years[0]->min; $year <= $years[0]->max; $year++){
            $allYears[] = $year;
        }

        for($nStratum = 1; $nStratum <= $totalOfStratum; $nStratum++) {
            $auxData = $stratumProductions[$nStratum];
            $newTempData = array();
            $countIterations = 0;
            $dataSize = count($auxData);

            for($year = $years[0]->min; $year <= $years[0]->max; $year++){
                if($countIterations < $dataSize &&
                    $auxData[$countIterations]->year == $year)
                {
                    $newTempData[] = $auxData[$countIterations]->total;
                    $countIterations++;
                }else{
                    $newTempData[] = 0;
                }
            }
            $data[$nStratum-1] = $newTempData;
        }

        $dataWithLabels = array();
        for($nStratum = 1; $nStratum <= $totalOfStratum; $nStratum++) {
            $dataWithLabels[] = ['label' => $stratumLabels[$nStratum - 1]->code, 'data' => $data[$nStratum - 1]];
        }
        return [$pattern[0] => $allYears, $pattern[1] => $dataWithLabels];
    }

    public function ProductionsPerQualisFilterDoctorateDegree($pattern): array
    {
        $totalOfStratum = DB::table('stratum_qualis')
            ->select(DB::raw('distinct stratum_qualis.id'))
            ->get();
        $totalOfStratum = count($totalOfStratum);

        $years = DB::table('productions')
            ->select(DB::raw('min(productions.year) as min, max(productions.year) as max'))
            ->get();

        $stratumLabels = StratumQualis::all('code');
        $stratumProductions = array();

        // jornals_id || publisher_id (Olhar depois)
        for($nStratum = 1; $nStratum <= $totalOfStratum; $nStratum++) {
            $data = DB::table('productions')
                ->select(DB::raw('productions.year, count(distinct productions.id) as total'))
                ->join('journals', 'productions.publisher_id', '=', 'journals.id')
                ->join('stratum_qualis', 'journals.stratum_qualis_id','=', 'stratum_qualis.id')
                ->join('users_productions', 'productions.id', '=', 'users_productions.productions_id')
                ->join('users', 'users_productions.users_id', '=', 'users.id')
                ->where('users.course_id', '=', 2)
                ->where('stratum_qualis.id', '=', $nStratum)
                ->groupBy('productions.year', 'stratum_qualis.id')
                ->get();
            $stratumProductions[$nStratum] = $data;
        }

        $data = array();
        $allYears = array();
        for($year = $years[0]->min; $year <= $years[0]->max; $year++){
            $allYears[] = $year;
        }

        for($nStratum = 1; $nStratum <= $totalOfStratum; $nStratum++) {
            $auxData = $stratumProductions[$nStratum];
            $newTempData = array();
            $countIterations = 0;
            $dataSize = count($auxData);

            for($year = $years[0]->min; $year <= $years[0]->max; $year++){
                if($countIterations < $dataSize &&
                    $auxData[$countIterations]->year == $year)
                {
                    $newTempData[] = $auxData[$countIterations]->total;
                    $countIterations++;
                }else{
                    $newTempData[] = 0;
                }
            }
            $data[$nStratum-1] = $newTempData;
        }

        $dataWithLabels = array();
        for($nStratum = 1; $nStratum <= $totalOfStratum; $nStratum++) {
            $dataWithLabels[] = ['label' => $stratumLabels[$nStratum - 1]->code, 'data' => $data[$nStratum - 1]];
        }
        return [$pattern[0] => $allYears, $pattern[1] => $dataWithLabels];
    }

    public function ProductionsPerQualisFilterByTeacher($pattern): array
    {
        $totalOfStratum = DB::table('stratum_qualis')
            ->select(DB::raw('distinct stratum_qualis.id'))
            ->get();
        $totalOfStratum = count($totalOfStratum);

        $years = DB::table('productions')
            ->select(DB::raw('min(productions.year) as min, max(productions.year) as max'))
            ->get();

        $stratumLabels = StratumQualis::all('code');
        $stratumProductions = array();

        // jornals_id || publisher_id (Olhar depois)
        for($nStratum = 1; $nStratum <= $totalOfStratum; $nStratum++) {
            $data = DB::table('productions')
                ->select(DB::raw('productions.year, count(distinct productions.id) as total'))
                ->join('journals', 'productions.publisher_id', '=', 'journals.id')
                ->join('stratum_qualis', 'journals.stratum_qualis_id','=', 'stratum_qualis.id')
                ->join('users_productions', 'productions.id', '=', 'users_productions.productions_id')
                ->join('users', 'users_productions.users_id', '=', 'users.id')
                ->where('users.type', '!=', UserType::STUDENT)
                ->groupBy('productions.year', 'users.name')
                ->get();
            $stratumProductions[$nStratum] = $data;
        }

        $data = array();
        $allYears = array();
        for ($year = $years[0]->min; $year <= $years[0]->max; $year++) {
            $allYears[] = $year;
        }

        for ($nStratum = 1; $nStratum <= $totalOfStratum; $nStratum++) {
            $auxData = $stratumProductions[$nStratum];
            $newTempData = array();
            $countIterations = 0;
            $dataSize = count($auxData);

            for ($year = $years[0]->min; $year <= $years[0]->max; $year++) {
                if ($countIterations < $dataSize &&
                    $auxData[$countIterations]->year == $year) {
                    $newTempData[] = $auxData[$countIterations]->total;
                    $countIterations++;
                } else {
                    $newTempData[] = 0;
                }
            }
            $data[$nStratum - 1] = $newTempData;
        }

        $dataWithLabels = array();
        for ($nStratum = 1; $nStratum <= $totalOfStratum; $nStratum++) {
            $dataWithLabels[] = ['label' => $stratumLabels[$nStratum - 1]->code, 'data' => $data[$nStratum - 1]];
        }
        return [$pattern[0] => $allYears, $pattern[1] => $dataWithLabels];
    }
}
