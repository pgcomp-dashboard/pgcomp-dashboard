<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

Route::get('/', function () {
    return response()->json([
        'app' => config('app.name'),
        'version' => '1.0.0',
        'status' => 'Healthy',
        'environment' => app()->environment(),
        'message' => 'This is the API backend. Please visit https://pgcomp.app.ic.ufba.br for the application.'
    ]);
});
