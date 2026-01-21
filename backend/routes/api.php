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
use App\Http\Controllers\Api\PanelAdmin\TestController;
use App\Http\Controllers\Api\PanelAdmin\UserController as UserAdminController;
use App\Http\Controllers\Api\PanelAdmin\UserProgramController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\ScrapingExecutionController;
use App\Http\Controllers\Api\PanelAdmin\RankingController;

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

// Free Access routes
Route::post('login', [AuthController::class, 'login']);
Route::post('forgot-password', [UserAdminController::class, 'forgotPassword']);
Route::post('reset-password', [UserAdminController::class, 'resetPassword']);
Route::get('scraping_execution', [ScrapingExecutionController::class, 'listExecutions']);
//Route::post('portal/user/lattes-update', [UserController::class, 'importLattesFile']);


// Middleware
Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

// Dashboard Routes
Route::group( ['name' => 'dashboard.', 'prefix' => 'dashboard'], function () {
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

// Logged group routes
Route::group(['middleware' => ['auth:sanctum']], function () {
    // Login general access routes
    Route::group(
        ['name' => 'portal', 'prefix' => 'portal'],
        function () {
    Route::get('journal',[ PublisherController::class, 'journalByIssn']);
    Route::get('conference', [PublisherController::class, 'conferenceByInitials']);
    Route::get('user/info', [UserAdminController::class, 'getUserInfo']);
    Route::put('user/update', [UserAdminController::class, 'changePassword']);
    Route::apiResource('qualis', StratumQualisController::class)->only(['index']);
    Route::apiResource('ranking', RankingController::class)->except(['destroy']);
    Route::get('user/productions', [ProductionAdminController::class, 'userProductions']);
    Route::post('user/productions',[ProductionAdminController::class,'userCreateProduction']);
            Route::delete('user/productions/all', [ProductionAdminController::class, 'deleteAll']);
    //Route::put('user/productions', [ProductionAdminController::class, 'updateProduction']);
    Route::apiResource('user/productions', ProductionAdminController::class)->only(['update', 'destroy']);
    Route::post('user/productions/doi',[ProductionAdminController::class,'productionFromDoi']);
    Route::post('user/lattes-update', [UserController::class, 'importLattesFile']);
        }
    );

    // Admin group routes
    Route::group(['name' => 'admin.', 'prefix' => 'admin', 'middleware' => [IsAdmin::class]], function () {
        Route::apiResource('users', UserAdminController::class);
        Route::apiResource('journals', PublisherController::class, ['as' => 'journals']);
        Route::apiResource('conferences', PublisherController::class, ['as' => 'conferences']);
        Route::apiResource('courses', CourseController::class)->except(['destroy']);
        //Route::apiResource('productions', ProductionAdminController::class)->except(['destroy']);
        //Route::apiResource('qualis', StratumQualisController::class);
        Route::apiResource('areas', AreaController::class);
        Route::apiResource('students', StudentAdminController::class);
        Route::apiResource('students.productions', StudentProductionController::class)
            ->except(['destroy']);
        Route::apiResource('professors', ProfessorController::class)->except(['destroy']);
        Route::apiResource('professors.productions', ProfessorProductionController::class)
            ->except(['destroy']);

        //Update Qualis By SpreadSheets
        Route::post('conference-qualis-spreadsheet', [StratumQualisController::class, 'importConferenceFile']);
        Route::post('journal-qualis-spreadsheet', [StratumQualisController::class, 'importJournalFile']);

        // Scraping routes
        Route::get('scraping_execution_interval', [ScrapingExecutionController::class, 'getInterval']);
        Route::post('scraping_execution_interval', [ScrapingExecutionController::class, 'setInterval']);
        Route::post('execute_scraping', [ScrapingExecutionController::class, 'execute']);
        Route::post('execute_professor_scraping', [ScrapingExecutionController::class, 'professor_scraping']);
    });
});

// Healthcheck route
Route::get('healthcheck', function (Request $request) {
    \Illuminate\Support\Facades\DB::getPdo();
    $startTime = defined('LARAVEL_START') ? LARAVEL_START : $request->server('REQUEST_TIME_FLOAT');

    return ['success' => true, 'response_time_in_ms' => floor((microtime(true) - $startTime) * 1000)];
});
