<?php

use App\Http\Controllers\Api\Dashboard\DashboardController;
use App\Http\Controllers\Api\Dashboard\ProductionsController;
use App\Http\Controllers\Api\Dashboard\ProgramsController;
use App\Http\Controllers\Api\Dashboard\QualisController;
use App\Http\Controllers\Api\Dashboard\StudentsController;

use \App\Http\Controllers\Api\PanelAdmin\FieldsAdminController;
use \App\Http\Controllers\Api\PanelAdmin\QualisAdminController;

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
    Route::get('fields', [StudentsController::class, 'studentsArea']);
    Route::get('subfields', [StudentsController::class, 'studentsSubarea']);
    Route::get('total_students_per_advisor', [DashboardController::class, 'advisors']);
});

Route::group(['name' => 'panel.', 'prefix' => 'panel'], function (){

    Route::get('field/{id}', [FieldsAdminController::class, 'area']);
    Route::get('subfield/{id}', [FieldsAdminController::class, 'subarea']);
    Route::get('qualis/{id}', [QualisAdminController::class, 'qualis']);
});


