<?php

use App\Http\Controllers\Api\Dashboard\DashboardController;
use App\Http\Controllers\Api\Dashboard\ProductionsController;
use App\Http\Controllers\Api\Dashboard\ProgramsController;
use App\Http\Controllers\Api\Dashboard\QualisController;
use App\Http\Controllers\Api\Dashboard\StudentsController;
use App\Http\Controllers\Api\PanelAdmin\AreaController;
use App\Http\Controllers\Api\PanelAdmin\ConferenceController;
use App\Http\Controllers\Api\PanelAdmin\CourseController;
use App\Http\Controllers\Api\PanelAdmin\JournalController;
use App\Http\Controllers\Api\PanelAdmin\ProductionController as ProductionAdminController;
use App\Http\Controllers\Api\PanelAdmin\ProfessorProductionController;
use App\Http\Controllers\Api\PanelAdmin\StudentProductionController;
use App\Http\Controllers\Api\PanelAdmin\ProfessorController;
use App\Http\Controllers\Api\PanelAdmin\ProgramController as ProgramAdminController;
use App\Http\Controllers\Api\PanelAdmin\StratumQualisController;
use App\Http\Controllers\Api\PanelAdmin\StudentController as StudentAdminController;
use App\Http\Controllers\Api\PanelAdmin\SubareaController;
use App\Http\Controllers\Api\PanelAdmin\UserController as UserAdminController;
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
    //TODO: Dar nomes melhores e mais padrao
    Route::get('program', [ProgramsController::class, 'programName']);
    Route::get('all_production', [ProductionsController::class, 'totalProductionsPerYear']);
    Route::get('students_production', [ProductionsController::class, 'studentsProductions']);

    Route::get('production_per_qualis', [QualisController::class, 'productionPerQualis']);
    Route::get('production_per_qualis/master', [QualisController::class, 'productionPerQualisFilterMasterDegree']);
    Route::get('production_per_qualis/doctor', [QualisController::class, 'productionPerQualisFilterDoctorateDegree']);
    Route::get('production_per_qualis/teacher', [QualisController::class, 'productionPerQualisFilterByTeacher']);


    Route::get('subfields', [StudentsController::class, 'studentsSubarea']);
    Route::get('subfields/master', [StudentsController::class,  'studentsMasterDegreeSubareas']);
    Route::get('subfields/doctorate', [StudentsController::class, 'studentsDoctorateDegreeSubareas']);
    Route::get('subfields/active', [StudentsController::class, 'studentsActiveAreas']);
    Route::get('subfields/disabled', [StudentsController::class, 'studentsNotActiveSubareas']);
    Route::get('subfields/completed', [StudentsController::class, 'studentsCompletedSubareas']);

    Route::get('fields', [StudentsController::class, 'studentsArea']);
    Route::get("fields/master", [StudentsController::class, 'studentsMasterDegreeAreas']);
    Route::get("fields/doctorate", [StudentsController::class, 'studentsDoctorateDegreeArea']);
    Route::get("fields/active", [StudentsController::class, 'studentsActiveAreas']);
    Route::get("fields/disabled", [StudentsController::class, 'studentsNotActiveArea']);
    Route::get("fields/completed", [StudentsController::class, 'studentsCompletedAreas']);
    Route::get('total_students_per_advisor', [DashboardController::class, 'advisors']);
});

Route::group(['middleware' => ['auth:sanctum'], 'name' => 'portal.', 'prefix' => 'portal'], function () {
    Route::post('user/lattes-update', [UserController::class, 'importLattesFile']);

    Route::group(['name' => 'admin.', 'prefix' => 'admin', 'middleware' => [IsAdmin::class]], function () {
        Route::apiResource('journals', JournalController::class);
        Route::apiResource('conferences', ConferenceController::class);
        Route::apiResource('courses', CourseController::class);
        Route::apiResource('productions', ProductionAdminController::class);
        Route::apiResource('productions/student', ProfessorProductionController::class)
            ->except(['store', 'update']);
        Route::apiResource('productions/professor', StudentProductionController::class)
            ->except(['store', 'update']);;
        Route::apiResource('programs', ProgramAdminController::class);
        Route::apiResource('qualis', StratumQualisController::class)->except(['destroy']);
        Route::apiResource('areas', AreaController::class);
        Route::apiResource('subareas', SubareaController::class);
        Route::apiResource('users', UserAdminController::class);
        Route::apiResource('students', StudentAdminController::class);
        Route::apiResource('professors', ProfessorController::class);
    });
});

Route::get('healthcheck', fn() => ['success' => true]);
