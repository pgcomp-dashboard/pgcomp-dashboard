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
        if(is_null(Course::where('sigaa_id', $newCourse['sigaa_id'])->first())){
            $course = Course::fillCourseFields($course, $newCourse); 
            $course->save();
            return true;
        } 
        return false;
    }

    public function editCourse($oldSigaaId, $course){
        $editableCourse = Course::checkIfCourseAlreadyExist($oldSigaaId);
        if(is_null($editableCourse)){
            return "error";
        }
        $editableCourse = Course::fillCourseFields($editableCourse, $course);
        $editableCourse->save();
        return true;
    }

    public function deleteCourse($sigaaId){
        $course = Course::checkIfCourseAlreadyExist($sigaaId);
        if(is_null($course)){
            return "error";
        }
        $course->delete();
        return true;
    }

    public function findCourseByName($courseName){
        $course = new Course();
        $course = Course::where('name', $courseName)->first();
        if(is_null($course)){
            return "error";
        }
        return $course;
    }

    public function findBySigaaID($sigaaId){
        return Course::checkIfCourseAlreadyExist($sigaaId);
    }

    public function findAllCourses(){
        return Course::all();
    }

    protected function checkIfCourseAlreadyExist($sigaaId){
        $course = new Course();
        $course = Course::find($sigaaId);
        if(is_null($course)){
            return "error";
        }
        return $course;
    }

    protected function fillCourseFields($course, $courseArray){
        $course->sigaa_id = $courseArray['sigaa_id'];
        $course->name = $courseArray['name'];
        return $course;
    }

}
