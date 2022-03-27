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
    protected $fillable = ['registration', 'siape', 'name', 'type', 'area', 'email', 'password','advisor_id', 'course_id'];

    protected $hidden = ['password', 'remember_token'];

    protected $casts = ['email_verified_at' => 'datetime', 'is_admin' => 'bool'];

    protected $attributes = ['is_admin' => false];


    public function isAdvisoredBy() {
        return $this->hasMany(User::class, 'advisor_id');
    }

    public function belongsToTheCourse() {
        return $this->hasOne(Course::class, 'course_id');
    }

    
    public function saveNewProfessorUser($newUser){
        $user = new User();
        $user = User::fillProfessorUserFields($user, $newUser); 
        $user->save();
        return true;
    }

    
    public function saveNewStudentUser($newUser){
        $user = new User();
        $user = user::fillStudentUserFields($user, $newUser); 
        $user->save();
        return true;
    }

    public function editUser($oldSigaaId, $User){
        $editableUser = User::checkIfUserAlreadyExist($oldSigaaId);
        $editableUser = User::fillUserFields($editableUser, $User);
        $editableUser->save();
    }


    public function deleteUser($sigaaId){
        $User = User::checkIfUserAlreadyExist($sigaaId);
        $User->delete();
    }

    public function findUserByName($UserName){
        return User::where('name', $UserName)->first();
    }

    public function findProfessorBySiape($siape){
        return User::where('siape', $siape)->first();
    }

    public function findStudentByRegistration($registration){
        return User::where('registration', $registration);
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

    protected function fillProfessorUserFields($professor, $professorArray){
        $professor->name = $professorArray['name'];
        $professor->siape = $professorArray['siape'];
        $professor->type = User::PROFESSOR;
        return $professor;
    }

    public function fillStudentUserFields($student, $studentArray){
        $professor = new User();
        $siapeCode = $studentArray['teachers']['siape'];
        $professor = $professor->findProfessorBySiape($siapeCode);

        $course = new Course();
        $course = $course->findCourseByName($studentArray['course']);

        $student->registration = $studentArray['registration'];
        $student->name = $studentArray['name'];
        $student->type = User::STUDENT;
        $student->advisor_id = $professor->id;
        $student->course_id = $course->sigaa_id;
        return $student;
    }

}
