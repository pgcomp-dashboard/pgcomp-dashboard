<?php

use Illuminate\Support\Facades\Route;
use App\Models\StratumQualis;
use App\Models\User;
use App\Models\Production;
use App\Models\Journal;

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

Route::get('/test', function () {
    $s = new StratumQualis();
    $u = new User();
    $p = new Production();
    $j = new Journal();
    //return $p->createOrUpdateProduction(['title' => 'A', 'year' => 2019, 'journals_id' => 1]);
    //return $j->createOrUpdateJournal(['name'=> 'A', 'stratum_qualis_id' => 1]);
    //return $s->createOrUpdateStratumQualis(['code' => 'A2', 'score' => 8]);
    //return $s->findAll();
});
