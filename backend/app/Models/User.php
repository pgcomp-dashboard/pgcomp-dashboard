<?php

namespace App\Models;

use App\Enums\UserRelationType;
use App\Enums\UserType;
use Database\Factories\UserFactory;
use DateTimeInterface;
use Eloquent;
use Illuminate\Auth\Authenticatable;
use Illuminate\Auth\MustVerifyEmail;
use Illuminate\Auth\Notifications\ResetPassword as ResetPasswordNotification;
use Illuminate\Auth\Passwords\CanResetPassword;
use Illuminate\Contracts\Auth\Access\Authorizable as AuthorizableContract;
use Illuminate\Contracts\Auth\Authenticatable as AuthenticatableContract;
use Illuminate\Contracts\Auth\CanResetPassword as CanResetPasswordContract;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Query\Expression;
use Illuminate\Database\Query\JoinClause;
use Illuminate\Foundation\Auth\Access\Authorizable;
use Illuminate\Notifications\DatabaseNotification;
use Illuminate\Notifications\DatabaseNotificationCollection;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Arr;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Enum;
use Laravel\Fortify\Rules\Password;
use Laravel\Sanctum\HasApiTokens;
use Laravel\Sanctum\PersonalAccessToken;

/**
 * App\Models\User
 *
 * @property int $id
 * @property int|null $registration
 * @property int|null $siape
 * @property string $name
 * @property UserType $type
 * @property string|null $email
 * @property Carbon|null $email_verified_at
 * @property string $password
 * @property string|null $two_factor_secret
 * @property string|null $two_factor_recovery_codes
 * @property bool $is_admin
 * @property int|null $subarea_id
 * @property int|null $program_id
 * @property int|null $course_id
 * @property string|null $lattes_url
 * @property string|null $remember_token
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property string|null $defended_at
 * @property string|null $lattes_id
 * @property string|null $lattes_updated_at
 * @property-read Collection|User[] $advisedes
 * @property-read int|null $advisedes_count
 * @property-read Collection|User[] $advisors
 * @property-read int|null $advisors_count
 * @property-read Program|null $belongsToTheCourse
 * @property-read Collection|User[] $coadviseees
 * @property-read int|null $coadviseees_count
 * @property-read Collection|User[] $coadvisors
 * @property-read int|null $coadvisors_count
 * @property-read Collection|User[] $isAdvisoredBy
 * @property-read int|null $is_advisored_by_count
 * @property-read DatabaseNotificationCollection|DatabaseNotification[] $notifications
 * @property-read int|null $notifications_count
 * @property-read Collection|PersonalAccessToken[] $tokens
 * @property-read int|null $tokens_count
 * @property-read Collection|Production[] $writerOf
 * @property-read int|null $writer_of_count
 * @method static UserFactory factory(...$parameters)
 * @method static Builder|User newModelQuery()
 * @method static Builder|User newQuery()
 * @method static Builder|User query()
 * @method static Builder|User whereCourseId($value)
 * @method static Builder|User whereCreatedAt($value)
 * @method static Builder|User whereDefendedAt($value)
 * @method static Builder|User whereEmail($value)
 * @method static Builder|User whereEmailVerifiedAt($value)
 * @method static Builder|User whereId($value)
 * @method static Builder|User whereIsAdmin($value)
 * @method static Builder|User whereLattesId($value)
 * @method static Builder|User whereLattesUpdatedAt($value)
 * @method static Builder|User whereLattesUrl($value)
 * @method static Builder|User whereName($value)
 * @method static Builder|User wherePassword($value)
 * @method static Builder|User whereProgramId($value)
 * @method static Builder|User whereRegistration($value)
 * @method static Builder|User whereRememberToken($value)
 * @method static Builder|User whereSiape($value)
 * @method static Builder|User whereSubareaId($value)
 * @method static Builder|User whereTwoFactorRecoveryCodes($value)
 * @method static Builder|User whereTwoFactorSecret($value)
 * @method static Builder|User whereType($value)
 * @method static Builder|User whereUpdatedAt($value)
 * @mixin Eloquent
 */
class User extends BaseModel implements AuthenticatableContract, AuthorizableContract, CanResetPasswordContract
{
    use HasApiTokens, HasFactory, Notifiable;
    use Authenticatable, Authorizable, CanResetPassword, MustVerifyEmail;

    protected $fillable = [
        'registration',
        'siape',
        'name',
        'type',
        'subarea_id',
        'email',
        'password',
        'course_id',
        'program_id',
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

    public static function creationRules(): array
    {
        return [
            'registration' => 'nullable|int|required_if:type,' . UserType::STUDENT->value,
            'siape' => 'nullable|int|required_if:type,' . UserType::PROFESSOR->value,
            'name' => 'required|string|max:255',
            'type' => ['required', new Enum(UserType::class)],
            'subarea_id' => [
                'nullable',
                'int',
                Rule::exists(Subarea::class, 'id')
            ],
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
                'required_if:type,' . UserType::STUDENT->value,
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

    public static function createOrUpdateStudent(array $data): User
    {
        $data['type'] = UserType::STUDENT->value;
        $password = Hash::make(Str::random(12));
        $data['password'] = $password;
        $data['password_confirmation'] = $password;

        return User::updateOrCreate(
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

        return User::updateOrCreate(
            Arr::only($data, ['siape']),
            $data
        );
    }

    public function writerOf(): BelongsToMany
    {
        return $this->belongsToMany(Production::class, 'users_productions', 'users_id', 'productions_id');
    }

    public function program(): BelongsTo
    {
        return $this->belongsTo(Program::class, 'program_id');
    }

    public function findUserByName($UserName): User
    {
        return User::where('name', $UserName)->firstOrFail();
    }

    public function findProfessorBySiape(int $siape): User
    {
        return User::where('siape', $siape)->firstOrFail();
    }

    public function findStudentByRegistration($registration): User
    {
        return User::where('registration', $registration)->firstOrFail();
    }

    public function updateRules(): array
    {
        $courseIdRules = [
            'int',
            Rule::exists(Course::class, 'id'),
        ];
        if ($this->type === UserType::PROFESSOR) {
            $courseIdRules[] = 'nullable';
        }

        return [
            'name' => 'string|max:255',
            'subarea' => [
                'nullable',
                'int',
                Rule::exists(Subarea::class, 'id')
            ],
            'course_id' => $courseIdRules,
            'program_id' => [
                'nullable',
                'int',
                Rule::exists(Program::class, 'id'),
            ],
            'lattes_url' => 'nullable|string|max:255',
        ];
    }

    public function advisors(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'user_user', 'student_user_id', 'professor_user_id')
            ->wherePivot('relation_type', UserRelationType::ADVISOR);
    }

    public function advisedes(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'user_user', 'professor_user_id', 'student_user_id')
            ->wherePivot('relation_type', UserRelationType::ADVISOR)
            ->whereNull('defended_at');

    }

    public function coadvisors(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'user_user', 'student_user_id', 'professor_user_id')
            ->wherePivot('relation_type', UserRelationType::CO_ADVISOR);
    }

    public function coadviseees(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'user_user', 'professor_user_id', 'student_user_id')
            ->wherePivot('relation_type', UserRelationType::CO_ADVISOR)
            ->whereNull('defended_at');
    }

    public function subareasMasterFilter(): array
    {
        $data = DB::table('users')
            ->join('subareas', 'users.subarea_id', '=', 'subareas.id')
            ->select(DB::raw('subareas.subarea_name, count(users.subarea_id) as subarea_count'))
            ->where('users.type', '=', UserType::STUDENT)
            ->where('users.course_id', '=', 1)
            ->groupBy('subareas.subarea_name')
            ->get();

        $dataSubfields = [];
        $dataCount = [];
        for ($counter = 0; $counter < count($data); $counter++) {
            $dataSubfields[$counter] = $data[$counter]->subarea_name;
            $dataCount[$counter] = $data[$counter]->subarea_count;
        }

        return [$dataSubfields, $dataCount];
    }

    public function areasMasterFilter(): array
    {
        $data = DB::table('users')
            ->join('subareas', 'users.subarea_id', '=', 'subareas.id')
            ->join('areas', 'areas.id', '=', 'subareas.area_id')
            ->select(DB::raw('areas.area_name, count(areas.id) as area_count'))
            ->where('users.type', '=', UserType::STUDENT)
            ->where('users.course_id', '=', 1)
            ->groupBy('areas.area_name')
            ->get();

        $dataFields = [];
        $dataCount = [];
        for ($counter = 0; $counter < count($data); $counter++) {
            $dataFields[$counter] = $data[$counter]->area_name;
            $dataCount[$counter] = $data[$counter]->area_count;
        }

        return [$dataFields, $dataCount];
    }

    public function areasDoctorFilter(): array
    {
        $data = DB::table('users')
            ->join('subareas', 'users.subarea_id', '=', 'subareas.id')
            ->join('areas', 'areas.id', '=', 'subareas.area_id')
            ->select(DB::raw('areas.area_name, count(areas.id) as area_count'))
            ->where('users.type', '=', UserType::STUDENT)
            ->where('users.course_id', '=', 2)
            ->groupBy('areas.area_name')
            ->get();

        $dataFields = [];
        $dataCount = [];
        for ($counter = 0; $counter < count($data); $counter++) {
            $dataFields[$counter] = $data[$counter]->area_name;
            $dataCount[$counter] = $data[$counter]->area_count;
        }

        return [$dataFields, $dataCount];
    }

    public function subareasDoctorFilter(): array
    {
        $data = DB::table('users')
            ->join('subareas', 'users.subarea_id', '=', 'subareas.id')
            ->select(DB::raw('subareas.subarea_name, count(users.subarea_id) as subarea_count'))
            ->where('users.type', '=', UserType::STUDENT)
            ->where('users.course_id', '=', 2)
            ->groupBy('subareas.subarea_name')
            ->get();

        $dataSubfields = [];
        $dataCount = [];
        for ($counter = 0; $counter < count($data); $counter++) {
            $dataSubfields[$counter] = $data[$counter]->subarea_name;
            $dataCount[$counter] = $data[$counter]->subarea_count;
        }

        return [$dataSubfields, $dataCount];
    }


    public function areasActiveFilter(): array
    {
        $data = DB::table('users')
            ->join('subareas', 'users.subarea_id', '=', 'subareas.id')
            ->join('areas', 'areas.id', '=', 'subareas.area_id')
            ->select(DB::raw('areas.area_name, count(areas.id) as area_count'))
            ->where('users.type', '=', UserType::STUDENT)
            ->where('users.defended_at', '=', null)
            ->groupBy('areas.area_name')
            ->get();

        $dataFields = [];
        $dataCount = [];
        for ($counter = 0; $counter < count($data); $counter++) {
            $dataFields[$counter] = $data[$counter]->area_name;
            $dataCount[$counter] = $data[$counter]->area_count;
        }

        return [$dataFields, $dataCount];
    }

    public function subareasActiveFilter(): array
    {
        $data = DB::table('users')
            ->join('subareas', 'users.subarea_id', '=', 'subareas.id')
            ->select(DB::raw('subareas.subarea_name, count(users.subarea_id) as subarea_count'))
            ->where('users.type', '=', UserType::STUDENT)
            ->where('users.defended_at', '=', null)
            ->groupBy('subareas.subarea_name')
            ->get();

        $dataSubfields = [];
        $dataCount = [];
        for ($counter = 0; $counter < count($data); $counter++) {
            $dataSubfields[$counter] = $data[$counter]->subarea_name;
            $dataCount[$counter] = $data[$counter]->subarea_count;
        }

        return [$dataSubfields, $dataCount];
    }

    public function areasNotActiveFilter(): array
    {
        $data = DB::table('users')
            ->join('subareas', 'users.subarea_id', '=', 'subareas.id')
            ->join('areas', 'areas.id', '=', 'subareas.area_id')
            ->select(DB::raw('areas.area_name, count(areas.id) as area_count'))
            ->where('users.type', '=', UserType::STUDENT)
            ->where('users.defended_at', '!=', null)
            ->groupBy('areas.area_name')
            ->get();

        $dataFields = [];
        $dataCount = [];
        for ($counter = 0; $counter < count($data); $counter++) {
            $dataFields[$counter] = $data[$counter]->area_name;
            $dataCount[$counter] = $data[$counter]->area_count;
        }

        return [$dataFields, $dataCount];
    }

    public function subareasNotActiveFilter(): array
    {
        $data = DB::table('users')
            ->join('subareas', 'users.subarea_id', '=', 'subareas.id')
            ->select(DB::raw('subareas.subarea_name, count(users.subarea_id) as subarea_count'))
            ->where('users.type', '=', UserType::STUDENT)
            ->where('users.defended_at', '!=', null)
            ->groupBy('subareas.subarea_name')
            ->get();

        $dataFields = [];
        $dataCount = [];
        for ($counter = 0; $counter < count($data); $counter++) {
            $dataSubfields[$counter] = $data[$counter]->subarea_name;
            $dataCount[$counter] = $data[$counter]->subarea_count;
        }

        return [$dataFields, $dataCount];
    }


    public function areasCompletedFilter(): array
    {
        $data = DB::table('users')
            ->join('subareas', 'users.subarea_id', '=', 'subareas.id')
            ->join('areas', 'areas.id', '=', 'subareas.area_id')
            ->select(DB::raw('areas.area_name, count(areas.id) as area_count'))
            ->where('users.type', '=', UserType::STUDENT)
            ->where('users.defended_at', '!=', null)
            ->groupBy('areas.area_name')
            ->get();

        $dataFields = [];
        $dataCount = [];
        for ($counter = 0; $counter < count($data); $counter++) {
            $dataFields[$counter] = $data[$counter]->area_name;
            $dataCount[$counter] = $data[$counter]->area_count;
        }

        return [$dataFields, $dataCount];
    }

    public function subareasCompletedFilter(): array
    {
        $data = DB::table('users')
            ->join('subareas', 'users.subarea_id', '=', 'subareas.id')
            ->select(DB::raw('subareas.subarea_name, count(users.subarea_id) as subarea_count'))
            ->where('users.type', '=', UserType::STUDENT)
            ->where('users.defended_at', '!=', null)
            ->groupBy('subareas.subarea_name')
            ->get();

        $dataFields = [];
        $dataCount = [];
        for ($counter = 0; $counter < count($data); $counter++) {
            $dataSubfields[$counter] = $data[$counter]->subarea_name;
            $dataCount[$counter] = $data[$counter]->subarea_count;
        }

        return [$dataFields, $dataCount];
    }

    public function sendPasswordResetNotification($token)
    {
        ResetPasswordNotification::createUrlUsing(function (User $user, string $token) {
            return config('app.front_url') . '/reset-password?' .
                http_build_query(['token' => $token, 'email' => $user->getEmailForPasswordReset()]);
        });

        $this->notify(new ResetPasswordNotification($token));
    }

    public function updateLattes(array $data): void
    {
        foreach ($data['productions'] as $production) {
            if (!$production['doi']) {
                continue;
            }
            $this->writerOf()->updateOrCreate(Arr::only($production, ['doi']), $production);
        }
        $this->lattes_updated_at = $data['lattes_updated_at'];
        $this->save();
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

    public function programs(): BelongsToMany
    {
        return $this->belongsToMany(Program::class, 'users_programs')
            ->withPivot(['started_at', 'finished_at']);
    }

    public function currentProgramsIn(DateTimeInterface $date): BelongsToMany
    {
        $belongsToMany = $this->programs();

        return $belongsToMany->whereDate($belongsToMany->qualifyPivotColumn('started_at'), '<=', $date)
            ->where(function (Builder $builder) use ($date, $belongsToMany) {
                $builder->whereDate($belongsToMany->qualifyPivotColumn('finished_at'), '>=', $date)
                    ->orWhereNull($belongsToMany->qualifyPivotColumn('finished_at'))
                ;
            })
        ;
    }

    /**
     * @param int $programId
     * @return Collection<int, Program>
     */
    public function productionsByProgram(int $programId): Collection
    {
        return $this->writerOf()
            ->join('users_programs', function (JoinClause $joinClause) use ($programId) {
                $joinClause->on('users_programs.user_id', '=', 'users_productions.users_id')
                    ->whereColumn(new Expression('YEAR(users_programs.started_at)'), '<=', 'productions.year',)
                    ->where(function (JoinClause $builder) {
                        $builder->whereColumn(new Expression('YEAR(users_programs.finished_at)'), '>=', 'productions.year')
                            ->orWhereNull('users_programs.finished_at');
                    })
                    ->where('users_programs.program_id', $programId)
                ;
            })->get();
    }

    public function currentPrograms(): BelongsToMany
    {
        $belongsToMany = $this->programs();

        $belongsToMany->whereDate($belongsToMany->qualifyPivotColumn('started_at'), '<=', Carbon::now())
            ->where(function (Builder $builder) use ($belongsToMany) {
                $builder->whereDate($belongsToMany->qualifyPivotColumn('finished_at'), '>=', Carbon::now())
                    ->orWhereNull($belongsToMany->qualifyPivotColumn('finished_at'))
                ;
            })
        ;

        return $belongsToMany;
    }
}
