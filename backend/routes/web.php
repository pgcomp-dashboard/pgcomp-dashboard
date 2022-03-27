<?php

use Illuminate\Support\Facades\Route;
use \App\Models\Course;
use \App\Models\User;

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
    $user = new User;
    $course = new Course;
    $arr = ['registration' => 218220310, 'name' => 'Adeilson Antonio Da Silva','teachers' => ['siape' => 4], 'course' => 'Mestrado'];
    //return $arr['teachers'][0];
    //return $user->saveNewStudentUser($arr);
    //return $user->saveNewProfessorUser(['siape' => 4, 'name' => 'teste']);
    //return $course->saveNewCourse(['sigaa_id' => 2, 'name' => 'Mestrado']);
    //return $course->deleteCourse(2);
    //return $user->findNumberOfStudentsForEachProfessor();
    //return empty($arr['reg']);
});
