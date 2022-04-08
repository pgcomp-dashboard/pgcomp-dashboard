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

/**
 * App\Models\User
 *
 * @property int $id
 * @property int|null $registration
 * @property int|null $siape
 * @property string $name
 * @property UserType $type
 * @property string|null $area
 * @property string|null $email
 * @property \Illuminate\Support\Carbon|null $email_verified_at
 * @property string $password
 * @property string|null $two_factor_secret
 * @property string|null $two_factor_recovery_codes
 * @property bool $is_admin
 * @property int|null $program_id
 * @property int|null $course_id
 * @property string|null $lattes_url
 * @property string|null $remember_token
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property string|null $defended_at
 * @property-read \Illuminate\Database\Eloquent\Collection|User[] $advisedes
 * @property-read int|null $advisedes_count
 * @property-read \Illuminate\Database\Eloquent\Collection|User[] $advisors
 * @property-read int|null $advisors_count
 * @property-read \App\Models\Program|null $belongsToTheCourse
 * @property-read \Illuminate\Database\Eloquent\Collection|User[] $coadviseees
 * @property-read int|null $coadviseees_count
 * @property-read \Illuminate\Database\Eloquent\Collection|User[] $coadvisors
 * @property-read int|null $coadvisors_count
 * @property-read \Illuminate\Database\Eloquent\Collection|User[] $isAdvisoredBy
 * @property-read int|null $is_advisored_by_count
 * @property-read \Illuminate\Notifications\DatabaseNotificationCollection|\Illuminate\Notifications\DatabaseNotification[] $notifications
 * @property-read int|null $notifications_count
 * @property-read \Illuminate\Database\Eloquent\Collection|\Laravel\Sanctum\PersonalAccessToken[] $tokens
 * @property-read int|null $tokens_count
 * @method static \Database\Factories\UserFactory factory(...$parameters)
 * @method static \Illuminate\Database\Eloquent\Builder|User newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|User newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|User query()
 * @method static \Illuminate\Database\Eloquent\Builder|User whereArea($value)
 * @method static \Illuminate\Database\Eloquent\Builder|User whereCourseId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|User whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder|User whereEmail($value)
 * @method static \Illuminate\Database\Eloquent\Builder|User whereEmailVerifiedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder|User whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|User whereIsAdmin($value)
 * @method static \Illuminate\Database\Eloquent\Builder|User whereLattesUrl($value)
 * @method static \Illuminate\Database\Eloquent\Builder|User whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder|User wherePassword($value)
 * @method static \Illuminate\Database\Eloquent\Builder|User whereProgramId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|User whereRegistration($value)
 * @method static \Illuminate\Database\Eloquent\Builder|User whereRememberToken($value)
 * @method static \Illuminate\Database\Eloquent\Builder|User whereSiape($value)
 * @method static \Illuminate\Database\Eloquent\Builder|User whereTwoFactorRecoveryCodes($value)
 * @method static \Illuminate\Database\Eloquent\Builder|User whereTwoFactorSecret($value)
 * @method static \Illuminate\Database\Eloquent\Builder|User whereType($value)
 * @method static \Illuminate\Database\Eloquent\Builder|User whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder|User whereDefendedAt($value)
 * @mixin \Eloquent
 */
class User extends BaseModel
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'registration',
        'siape', // TODo: Nem sempre é siape, as vezes é rm se for aluno
        'name',
        'type', //TODO: Aceitar apenas três entradas. Docente, discente e admin
        'area',
        'email',
        'password',
        'course_id',
        'program_id',
        'lattes_url',
//        TODO: se for usar user como docente e discente tem que ter uma id apontando pra ele mesmo. Um aluno é diretamente ligado a um professor
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

    public function writerOf()
    {
        return $this->belongsToMany(Production::class);
    }

    public function belongsToTheCourse()
    {
        return $this->hasOne(Program::class, 'course_id');
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
        $user = User::where('name', $UserName)->firstOrFail();
        return User::checkIfUserWasFound($user);
    }

    public function findProfessorBySiape($siape)
    {
        $user = new User();
        $user = User::where('siape', $siape)->firstOrFail();
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
            'course_id' => [
                'nullable',
                'int',
                Rule::exists(Course::class, 'id'),
                'required_if:type,'.UserType::STUDENT->value,
            ],
            'program_id' => [
                'nullable',
                'int',
                Rule::exists(Program::class, 'id'),
                'required',
            ],
            'lattes_url' => 'nullable|string|max:255',
        ];
    }

    public static function updateRules(): array
    {
        return [
            'name' => 'string|max:255',
            'area' => 'nullable|string|max:255',
            'course_id' => [
                'nullable',
                'int',
                Rule::exists(Course::class, 'id'),
                'required_if:type,'.UserType::STUDENT->value,
            ],
            'program_id' => [
                'nullable',
                'int',
                Rule::exists(Program::class, 'id'),
                'required',
            ],
            'lattes_url' => 'nullable|string|max:255',
        ];
    }

    public function advisors(): \Illuminate\Database\Eloquent\Relations\BelongsToMany
    {
        return $this->belongsToMany(User::class, 'user_user', 'student_user_id', 'professor_user_id')
            ->wherePivot('relation_type', UserRelationType::ADVISOR);
    }

    public function advisedes(): \Illuminate\Database\Eloquent\Relations\BelongsToMany
    {
        return $this->belongsToMany(User::class, 'user_user', 'professor_user_id', 'student_user_id')
            ->wherePivot('relation_type', UserRelationType::ADVISOR)
            ->whereNull('defended_at');
    }

    public function coadvisors(): \Illuminate\Database\Eloquent\Relations\BelongsToMany
    {
        return $this->belongsToMany(User::class, 'user_user', 'student_user_id', 'professor_user_id')
            ->wherePivot('relation_type', UserRelationType::CO_ADVISOR);
    }

    public function coadviseees(): \Illuminate\Database\Eloquent\Relations\BelongsToMany
    {
        return $this->belongsToMany(User::class, 'user_user', 'professor_user_id', 'student_user_id')
            ->wherePivot('relation_type', UserRelationType::CO_ADVISOR)
            ->whereNull('defended_at');
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
