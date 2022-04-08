<?php

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

//TODO: Dar nomes melhores e mais padrao
Route::get('dashboard/program', [\App\Http\Controllers\Api\DashboardController::class, 'nomePrograma']);
Route::get('dashboard/all_production', [\App\Http\Controllers\Api\DashboardController::class, 'totalProducoes']);
Route::get('dashboard/production_per_qualis', [\App\Http\Controllers\Api\DashboardController::class, 'qualis']);
Route::get('dashboard/students_production', [\App\Http\Controllers\Api\DashboardController::class, 'producoesDiscentes']);
Route::get('dashboard/fields', [\App\Http\Controllers\Api\DashboardController::class, 'discentesArea']);
Route::get('dashboard/subfields', [\App\Http\Controllers\Api\DashboardController::class, 'discentesSubarea']);
Route::get('dashboard/total_students_per_advisor', [\App\Http\Controllers\Api\DashboardController::class, 'advisors']);
