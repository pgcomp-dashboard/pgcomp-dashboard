<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class User extends Authenticatable
{

    use HasApiTokens, HasFactory, Notifiable;

    protected const PROFESSOR = 'docente';
    protected const STUDENT = 'discente';

    //table name
    protected $table = 'users';

    protected $primaryKey = 'id';
    protected $fillable = ['registration', 'siape', 'name', 'type', 'area', 'email', 'password', 'course_id'];

    protected $hidden = ['password', 'remember_token'];

    protected $casts = ['email_verified_at' => 'datetime', 'is_admin' => 'bool'];

    protected $attributes = ['is_admin' => false];


    public function isAdvisoredBy() {
        return $this->belongsToMany(User::class);
    }

    public function belongsToTheCourse() {
        return $this->hasOne(Course::class, 'course_id');
    }
   
    public function saveNewProfessorUser($newUser){
        $user = new User();
        if(is_null(User::findProfessorBySiape($newUser['siape']))){
            $user = User::fillProfessorUserFields($user, $newUser); 
            $user->save();
            return true;
        }
        return false;
    }
   
    public function saveNewStudentUser($newUser){
        $user = new User();
        if(is_null(User::findStudentByRegistration([$newUser['registration']]))){
            $user = user::fillStudentUserFields($user, $newUser); 
            $user->save();
            return true;
        }
        return false;
    }

    public function editUser($oldSigaaId, $User){
        $editableUser = User::checkIfUserAlreadyExist($oldSigaaId);
        if(is_null($editableUser)){
            return false;
        }
        $editableUser = User::fillUserFields($editableUser, $User);
        $editableUser->save();
        return true;
    }

    public function deleteUser($sigaaId){
        $user = new User();
        $user = User::checkIfUserAlreadyExist($sigaaId);
        $user = User::checkIfUserWasFound($user);
        $user->delete();
    }

    public function findUserByName($UserName){
        $user = new User();
        $user = User::where('name', $UserName)->first();
        return User::checkIfUserWasFound($user);
    }

    public function findProfessorBySiape($siape){
        $user = new User();
        $user = User::where('siape', $siape)->first();
        return User::checkIfUserWasFound($user);
        
    }

    public function findStudentByRegistration($registration){
        $user = new User();
        $user = User::where('registration', $registration);
        return User::checkIfUserWasFound($user);
    }

    public function findAllUsers(){
        return User::all();
    }

    //nao terminado
    public function findNumberOfStudentsForEachProfessor(){
        $allProfessor = User::all('name', 'siape')->whereNotNull('siape')->count();
        return $allProfessor;
    }

    protected function checkIfUserAlreadyExist($sigaaId){
        return User::find($sigaaId);
    }

    protected function checkIfUserWasFound($user){
        if(is_null($user)){
            return 'error';
        }
        return $user;
    }

    protected function fillProfessorUserFields($professor, $professorArray){
        $professor->name = $professorArray['name'];
        $professor->siape = $professorArray['siape'];
        $professor->type = User::PROFESSOR;
        return $professor;
    }

    protected function fillStudentUserFields($student, $studentArray){
        $professor = new User();
        $siapeCode = $studentArray['teachers']['siape'];
        $professor = $professor->findProfessorBySiape($siapeCode);

        $course = new Course();
        $course = $course->findCourseByName($studentArray['course']);

        $student->registration = $studentArray['registration'];
        $student->name = $studentArray['name'];
        $student->type = User::STUDENT;
        //$student->advisor_id = $professor->id;
        $student->course_id = $course->sigaa_id;
        return $student;
    }
}