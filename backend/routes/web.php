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

Route::get('/test', function () {});
Route::get('/reset-password/{token}', function ($token) {
    return redirect('https://dashboard-pgcomp.app.ic.ufba.br/reset-password/' . $token);
})->name('password.reset');
