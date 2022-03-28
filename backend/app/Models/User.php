<?php

namespace App\Models;

use App\Enums\UserRelationType;
use App\Enums\UserType;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Enum;
use Laravel\Fortify\Rules\Password;
use Laravel\Sanctum\HasApiTokens;

class User extends BaseModel
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'registration',
        'siape',
        'name',
        'type',
        'area',
        'email',
        'password',
        'course_id',
        'lattes_url',
    ];

    protected $hidden = [
        'password',
        'remember_token',
        'is_admin',
        'two_factor_recovery_codes',
        'two_factor_secret',
        'email_verified_at',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'is_admin' => 'bool',
        'type' => UserType::class,
        'siape' => 'int',
        'course_id' => 'int',
    ];

    protected $attributes = [
        'is_admin' => false,
    ];


    public function isAdvisoredBy()
    {
        return $this->belongsToMany(User::class);
    }

    public function belongsToTheCourse()
    {
        return $this->hasOne(Course::class, 'course_id');
    }

    public function deleteUser($sigaaId)
    {
        $user = new User();
        $user = User::checkIfUserAlreadyExist($sigaaId);
        $user = User::checkIfUserWasFound($user);
        $user->delete();
    }

    public function findUserByName($UserName)
    {
        $user = new User();
        $user = User::where('name', $UserName)->first();
        return User::checkIfUserWasFound($user);
    }

    public function findProfessorBySiape($siape)
    {
        $user = new User();
        $user = User::where('siape', $siape)->first();
        return User::checkIfUserWasFound($user);

    }

    public function findStudentByRegistration($registration)
    {
        $user = new User();
        $user = User::where('registration', $registration);
        return User::checkIfUserWasFound($user);
    }

    public function findAllUsers()
    {
        return User::all();
    }

    //nao terminado
    public function findNumberOfStudentsForEachProfessor()
    {
        $allProfessor = User::all('name', 'siape')->whereNotNull('siape')->count();
        return $allProfessor;
    }

    protected function checkIfUserAlreadyExist($sigaaId)
    {
        return User::find($sigaaId);
    }

    protected function checkIfUserWasFound($user)
    {
        if (is_null($user)) {
            return 'error';
        }
        return $user;
    }

    public static function creationRules(): array
    {
        return [
            'registration' => 'nullable|int|required_if:type,'.UserType::STUDENT->value,
            'siape' => 'nullable|int|required_if:type,'.UserType::PROFESSOR->value,
            'name' => 'required|string|max:255',
            'type' => ['required', new Enum(UserType::class)],
            'area' => 'nullable|string|max:255',
            'email' => [
                'nullable',
                'string',
                'email',
                'max:255',
                Rule::unique(User::class),
            ],
            'password' => ['required', 'string', new Password, 'confirmed'],
            'course_id' => 'nullable|int|exists:courses,id',
            'lattes_url' => 'nullable|string|max:255',
        ];
    }

    public static function updateRules(): array
    {
        return [
            'name' => 'string|max:255',
            'area' => 'nullable|string|max:255',
            'course_id' => 'nullable|int|exists:courses,id',
            'lattes_url' => 'nullable|string|max:255',
        ];
    }

    public function advisors(): \Illuminate\Database\Eloquent\Relations\BelongsToMany
    {
        return $this->belongsToMany(User::class, 'user_user', 'student_user_id', 'professor_user_id')
            ->wherePivot('relation_type', UserRelationType::ADVISOR->value);
    }

    public function adviseees(): \Illuminate\Database\Eloquent\Relations\BelongsToMany
    {
        return $this->belongsToMany(User::class, 'user_user', 'professor_user_id', 'student_user_id')
            ->wherePivot('relation_type', UserRelationType::ADVISOR->value);
    }

    public function coadvisors(): \Illuminate\Database\Eloquent\Relations\BelongsToMany
    {
        return $this->belongsToMany(User::class, 'user_user', 'student_user_id', 'professor_user_id')
            ->wherePivot('relation_type', UserRelationType::CO_ADVISOR->value);
    }

    public function coadviseees(): \Illuminate\Database\Eloquent\Relations\BelongsToMany
    {
        return $this->belongsToMany(User::class, 'user_user', 'professor_user_id', 'student_user_id')
            ->wherePivot('relation_type', UserRelationType::CO_ADVISOR->value);
    }

    public static function createOrUpdateStudent(array $data): User
    {
        $data['type'] = UserType::STUDENT->value;
        $password = Hash::make(Str::random(12));
        $data['password'] = $password;
        $data['password_confirmation'] = $password;

        return User::updateOrCreateModel(
            Arr::only($data, ['registration']),
            $data
        );
    }

    public static function createOrUpdateTeacher(array $data): User
    {
        $data['type'] = UserType::PROFESSOR->value;
        $password = Hash::make(Str::random(12));
        $data['password'] = $password;
        $data['password_confirmation'] = $password;

        return User::updateOrCreateModel(
            Arr::only($data, ['siape']),
            $data
        );
    }
}
