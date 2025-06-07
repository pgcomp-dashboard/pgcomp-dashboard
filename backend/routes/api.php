<?php

use App\Http\Controllers\Api\Dashboard\DashboardController;
use App\Http\Controllers\Api\PanelAdmin\AreaController;
use App\Http\Controllers\Api\PanelAdmin\AuthController;
use App\Http\Controllers\Api\PanelAdmin\CourseController;
use App\Http\Controllers\Api\PanelAdmin\ProductionController as ProductionAdminController;
use App\Http\Controllers\Api\PanelAdmin\ProfessorController;
use App\Http\Controllers\Api\PanelAdmin\ProfessorProductionController;
use App\Http\Controllers\Api\PanelAdmin\ProgramController as ProgramAdminController;
use App\Http\Controllers\Api\PanelAdmin\PublisherController;
use App\Http\Controllers\Api\PanelAdmin\StratumQualisController;
use App\Http\Controllers\Api\PanelAdmin\StudentController as StudentAdminController;
use App\Http\Controllers\Api\PanelAdmin\StudentProductionController;
use App\Http\Controllers\Api\PanelAdmin\UserController as UserAdminController;
use App\Http\Controllers\Api\PanelAdmin\UserProgramController;
use App\Http\Controllers\Api\UserController;
use App\Http\Middleware\IsAdmin;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

Route::group(['name' => 'dashboard.', 'prefix' => 'dashboard'], function () {
    // TODO: Dar nomes melhores e mais padrao
    Route::get('program', [DashboardController::class, 'programName']);
    Route::get('all_production', [DashboardController::class, 'totalProductionsPerYear']);
    Route::get('students_production', [DashboardController::class, 'studentsProductions']);
    Route::get('production_per_qualis', [DashboardController::class, 'productionPerQualis']);
    Route::get('fields', [DashboardController::class, 'studentCountPerArea']);
    Route::get('students', [DashboardController::class, 'studentCountPerCourse']);
    Route::get('total_students_per_advisor', [DashboardController::class, 'advisors']);
    Route::get('defenses_per_year', [DashboardController::class, 'defensesPerYear']);
    Route::get('enrollments_per_year', [DashboardController::class, 'enrollmentsPerYear']);
    Route::get('professors', [DashboardController::class, 'allProfessors']);
    Route::get('professor/{professorId}/productions', [DashboardController::class, 'professorProduction']);
});

Route::group(['middleware' => ['auth:sanctum'], 'name' => 'portal.', 'prefix' => 'portal'], function () {
    Route::post('user/lattes-update', [UserController::class, 'importLattesFile']);

    Route::group(['name' => 'admin.', 'prefix' => 'admin', 'middleware' => [IsAdmin::class]], function () {
        Route::apiResource('journals', PublisherController::class, ['as' => 'journals']);
        Route::apiResource('conferences', PublisherController::class, ['as' => 'conferences']);
        Route::apiResource('courses', CourseController::class)->except(['destroy']);
        Route::apiResource('productions', ProductionAdminController::class)->except(['destroy']);
        Route::apiResource('qualis', StratumQualisController::class);
        Route::apiResource('users', UserAdminController::class)->except(['destroy']);
        Route::apiResource('areas', AreaController::class);
        Route::apiResource('students', StudentAdminController::class);
        Route::apiResource('students.productions', StudentProductionController::class)
            ->except(['destroy']);
        Route::apiResource('professors', ProfessorController::class)->except(['destroy']);
        Route::apiResource('professors.productions', ProfessorProductionController::class)
            ->except(['destroy']);

        Route::get('all_area', [AreaController::class, 'allArea']);
    });
});

Route::get('healthcheck', function (Request $request) {
    \Illuminate\Support\Facades\DB::getPdo();
    $startTime = defined('LARAVEL_START') ? LARAVEL_START : $request->server('REQUEST_TIME_FLOAT');

    return ['success' => true, 'response_time_in_ms' => floor((microtime(true) - $startTime) * 1000)];
});

Route::post('login', [AuthController::class, 'login']);
