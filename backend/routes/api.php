<?php

use App\Http\Controllers\Admin\AccreditationController;
use App\Http\Controllers\Admin\AdminApprovalController;
use App\Http\Controllers\Admin\AreaController;
use App\Http\Controllers\Admin\ConferenceController;
use App\Http\Controllers\Admin\CourseController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\JournalController;
use App\Http\Controllers\Admin\ProfessorController;
use App\Http\Controllers\Admin\ProfessorProductionController;
use App\Http\Controllers\Admin\PublisherController;
use App\Http\Controllers\Admin\ScrapingExecutionController;
use App\Http\Controllers\Admin\StratumQualisController;
use App\Http\Controllers\Admin\StudentController;
use App\Http\Controllers\Admin\StudentProductionController;
use App\Http\Controllers\Admin\UserController as UserAdminController;
use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\User\AdminRequestController;
use App\Http\Controllers\User\ProductionController;
use App\Http\Controllers\Admin\ProductionController as ProductionAdminController;
use App\Http\Controllers\User\UserController;
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

// Healthcheck route
Route::get('healthcheck', function (Request $request) {
    \Illuminate\Support\Facades\DB::getPdo();
    $startTime = defined('LARAVEL_START') ? LARAVEL_START : $request->server('REQUEST_TIME_FLOAT');

    return ['success' => true, 'response_time_in_ms' => floor((microtime(true) - $startTime) * 1000)];
});

// Free Access routes
Route::post('login', [AuthController::class, 'login']);
Route::post('forgot-password', [UserAdminController::class, 'forgotPassword']);
Route::post('reset-password', [UserAdminController::class, 'resetPassword']);

// Middleware
Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

// Logged group routes
Route::group(['middleware' => ['auth:sanctum']], function () {
    // Login general access routes
    Route::group(['as' => 'portal.', 'prefix' => 'portal'], function () {
        Route::get('journal', [PublisherController::class, 'journalByIssn']);
        Route::get('conference', [PublisherController::class, 'conferenceByInitials']);
        Route::apiResource('stratum_qualis', StratumQualisController::class)->only(['index']);
        Route::get('user', [UserController::class, 'userInfo']);
        Route::put('user', [UserController::class, 'updateUserInfo']);
        Route::put('user/password', [UserController::class, 'changePassword']);
        Route::post('lattes-update', [ProductionController::class, 'importLattesFile']);
        Route::get('productions', [ProductionController::class, 'userProductions']);
        Route::post('productions', [ProductionController::class, 'userCreateProduction']);
        Route::delete('productions/all', [ProductionController::class, 'deleteAll']);
        Route::apiResource('productions', ProductionController::class)->only(['update', 'destroy']);
        Route::post('productions/doi', [ProductionController::class, 'productionFromDoi']);
        Route::post('admin-request', [AdminRequestController::class, 'store']);
        Route::get('admin-status', [AdminRequestController::class, 'getStatus']);
    });

    // Admin group routes
    Route::group(['as' => 'admin.', 'prefix' => 'admin', 'middleware' => [IsAdmin::class]], function () {
        // Dashboard Routes
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

        Route::apiResource('users', UserAdminController::class);
        Route::apiResource('publishers', PublisherController::class);
        Route::apiResource('journals', JournalController::class)->except('destroy');
        Route::apiResource('conferences', ConferenceController::class)->except('destroy');
        Route::apiResource('stratum_qualis', StratumQualisController::class)->parameters(['stratum_qualis' => 'qualis']);
        Route::apiResource('courses', CourseController::class)->except(['destroy']);
        Route::apiResource('productions', ProductionAdminController::class)->except(['destroy']);
        Route::apiResource('areas', AreaController::class);
        Route::apiResource('students', StudentController::class);
        Route::apiResource('students.productions', StudentProductionController::class)
            ->except(['destroy']);
        Route::apiResource('professors', ProfessorController::class)->except(['destroy']);
        Route::apiResource('professors.productions', ProfessorProductionController::class)
            ->except(['destroy']);
        Route::apiResource('accreditation', AccreditationController::class)->except(['destroy']);
        Route::get('admin-request', [AdminApprovalController::class, 'index']);
        Route::post('admin-request/{user}', [AdminApprovalController::class, 'update']);
        Route::post('lattes-update/{user}', [ProductionAdminController::class, 'importLattesFile']);


        //Update Qualis By SpreadSheets
        Route::post('publishers/import', [PublisherController::class, 'import']);

        // Scraping routes
        Route::get('scraping_execution', [ScrapingExecutionController::class, 'listExecutions']);
        Route::get('scraping_execution_interval', [ScrapingExecutionController::class, 'getInterval']);
        Route::post('scraping_execution_interval', [ScrapingExecutionController::class, 'setInterval']);
        Route::post('execute_scraping', [ScrapingExecutionController::class, 'execute']);
        Route::post('execute_professor_scraping', [ScrapingExecutionController::class, 'professor_scraping']);
    });
});
