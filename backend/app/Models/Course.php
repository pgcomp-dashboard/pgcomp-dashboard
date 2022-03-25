<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Course extends Model
{
    //table name
    protected $table = 'courses';

    public $incrementing = false;

    protected $primaryKey = 'sigaa_id';
    protected $fillable = ['sigaa_id','name'];


    public function saveNewCourse($newCourse){
        $course = new Course();
        $course = Course::fillCourseFields($course, $newCourse); 
        $course->save();
        return true;
    }

    public function editCourse($oldSigaaId, $course){
        $editableCourse = Course::checkIfCourseAlreadyExist($oldSigaaId);
        $editableCourse = Course::fillCourseFields($editableCourse, $course);
        $editableCourse->save();
    }

    public function deleteCourse($sigaaId){
        $course = Course::checkIfCourseAlreadyExist($sigaaId);
        $course->delete();
    }

    public function findCourseByName($courseName){
        return Course::where('name', $courseName)->first();
    }

    public function findBySigaaID($sigaaId){
        return Course::checkIfCourseAlreadyExist($sigaaId);
    }

    public function findAllCourses(){
        return Course::all();
    }

    protected function checkIfCourseAlreadyExist($sigaaId){
        return Course::find($sigaaId);
    }

    protected function fillCourseFields($course, $courseArray){
        $course->sigaa_id = $courseArray['sigaa_id'];
        $course->name = $courseArray['name'];
        return $course;
    }

}
