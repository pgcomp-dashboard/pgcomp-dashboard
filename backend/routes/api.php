<?php

use App\Http\Controllers\Api\Dashboard\DashboardController;
use App\Http\Controllers\Api\Dashboard\ProductionsController;
use App\Http\Controllers\Api\Dashboard\ProgramsController;
use App\Http\Controllers\Api\Dashboard\QualisController;
use App\Http\Controllers\Api\Dashboard\StudentsController;
use App\Http\Controllers\Api\PanelAdmin\FieldsAdminController;
use App\Http\Controllers\Api\PanelAdmin\QualisAdminController;
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
    Route::get('fields', [StudentsController::class, 'studentsArea']);
    Route::get('subfields', [StudentsController::class, 'studentsSubarea']);
    Route::get('total_students_per_advisor', [DashboardController::class, 'advisors']);
});

Route::group(['middleware' => ['auth:sanctum'], 'name' => 'portal.', 'prefix' => 'portal'], function () {
    Route::post('user/lattes-update', [UserController::class, 'importLattesFile']);

    Route::group(['name' => 'admin.', 'prefix' => 'admin', 'middleware' => [IsAdmin::class]], function () {
        // @todo add admin routes
        //CRUD Area
        Route::get('field/{name}', [FieldsAdminController::class, 'area']);
        Route::post('field', function(Request $request){
            return (new FieldsAdminController())->saveArea($request);
        });
        Route::put('field', function(Request $request){
            return (new FieldsAdminController())->saveArea($request);
        });
        Route::delete('field/{name}', [FieldsAdminController::class, 'deleteArea']);

        //CRUD Subarea
        Route::get('subfield/{name}', [FieldsAdminController::class, 'subarea']);
        Route::post('subfield', function(Request $request){
            return (new FieldsAdminController())->saveSubarea($request);
        });
        Route::put('subfield', function(Request $request){
            return (new FieldsAdminController())->saveSubarea($request);
        });
        Route::delete('subfield/{name}', [FieldsAdminController::class, 'deleteSubarea']);

        //CRUD Qualis
        Route::get('qualis/{code}', [QualisAdminController::class, 'qualis']);
        Route::post('qualis', function(Request $request){
            return (new QualisAdminController())->saveQualis($request);
        });
        Route::put('qualis', function(Request $request){
            return (new QualisAdminController())->saveQualis($request);
        });
        Route::delete('qualis/{code}', [QualisAdminController::class, 'deleteQualis']);

        //List all save raws
        Route::get('fields', [FieldsAdminController::class, 'allArea']);
        Route::get('subfields', [FieldsAdminController::class, 'allSubarea']);
        Route::get('qualis', [QualisAdminController::class, 'allQualis']);

    });
});
