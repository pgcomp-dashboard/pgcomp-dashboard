<?php

namespace App\Models;

use App\Enums\UserCategory;
use App\Enums\UserRelationType;
use App\Enums\UserType;
use App\Exceptions\IsProtectedException;
use Database\Factories\UserFactory;
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
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
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
 * @property int|null $area_id
 * @property int|null $course_id
 * @property string|null $lattes_url
 * @property string|null $remember_token
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property string|null $defended_at
 * @property string|null $lattes_id
 * @property string|null $lattes_updated_at
 * @property string|null $admin_status
 * @property UserCategory $category
 * @property-read Collection|User[] $advisedes
 * @property-read int|null $advisedes_count
 * @property-read Collection|User[] $advisors
 * @property-read int|null $advisors_count
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
 *
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
 * @method static Builder|User whereRegistration($value)
 * @method static Builder|User whereRememberToken($value)
 * @method static Builder|User whereSiape($value)
 * @method static Builder|User whereAreaId($value)
 * @method static Builder|User whereTwoFactorRecoveryCodes($value)
 * @method static Builder|User whereTwoFactorSecret($value)
 * @method static Builder|User whereType($value)
 * @method static Builder|User whereUpdatedAt($value)
 *
 * @mixin Eloquent
 */
class User extends Model implements AuthenticatableContract, AuthorizableContract, CanResetPasswordContract
{
    use Authenticatable, Authorizable, CanResetPassword, MustVerifyEmail;
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'registration',
        'siape',
        'name',
        'type',
        'category',
        'area_id',
        'email',
        'password',
        'course_id',
        'lattes_url',
        'admin_status',
        'defended_at',
        'pq',
        'orcid',
        'lattes_xml_path',
        'lattes_xml_uploaded_at',
        'is_senior',
    ];

    protected $hidden = [
        'password',
        'remember_token',
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
        'pq' => 'boolean',
        'is_approved' => 'boolean',
        'is_senior' => 'boolean',
        'lattes_xml_uploaded_at' => 'datetime',
    ];

    protected $attributes = [
        'is_admin' => false,
        'is_protected' => true,
    ];

    public const STATUS_PENDING = 'pending';
    public const STATUS_APPROVED = 'approved';
    public const STATUS_REJECTED = 'rejected';

    /**
     * Establishes a relationship of belongsToMany with the production model
     *
     * @return BelongsToMany Relation of belongsToMany user -> production
     */
    public function writerOf(): BelongsToMany
    {
        return $this->belongsToMany(Production::class, 'users_productions', 'users_id', 'productions_id');
    }

    /**
     * Establishes a relationship of belongsToMany with the production model
     *
     * @return BelongsToMany<User> Relation of belongsToMany user -> production
     */
    public function advisors(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'user_user', 'student_user_id', 'professor_user_id')
            ->wherePivot('relation_type', UserRelationType::ADVISOR);
    }

    public function advisedes(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'user_user', 'professor_user_id', 'student_user_id')
            ->wherePivot('relation_type', UserRelationType::ADVISOR);
    }

    public function coadvisors(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'user_user', 'student_user_id', 'professor_user_id')
            ->wherePivot('relation_type', UserRelationType::CO_ADVISOR);
    }

    public function coadviseees(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'user_user', 'professor_user_id', 'student_user_id')
            ->wherePivot('relation_type', UserRelationType::CO_ADVISOR);
    }

    /**
     * @param  'mestrando'|'doutorando'|'completed'|null  $selectedFilter
     * @return array<string, int>
     */
    public static function userCountPerArea(?string $selectedFilter): array
    {
        $query = DB::table('user_user as uu')
            ->join('users as u', 'uu.student_user_id', '=', 'u.id')
            ->join('areas as a',   'u.area_id',        '=', 'a.id')
            ->join('courses as c', 'u.course_id',      '=', 'c.id')
            ->where('uu.relation_type', UserRelationType::ADVISOR);

        // Aplica filtros com base no tipo selecionado
        $query = match ($selectedFilter) {
            'mestrando'  => $query->where('c.name', '=', 'Mestrado')->whereNull('u.defended_at'),
            'doutorando' => $query->where('c.name', '=', 'Doutorado')->whereNull('u.defended_at'),
            'completed'  => $query->whereNotNull('u.defended_at'),
            default      => $query->whereNull('u.defended_at'), // Padrão para alunos ativos
        };

        return $query->groupBy('a.area')
            ->selectRaw('a.area, COUNT(DISTINCT u.id) AS userCount') // COUNT(DISTINCT u.id) para evitar contar o mesmo aluno múltiplas vezes
            ->pluck('userCount', 'area')
            ->toArray();
    }


    public function sendPasswordResetNotification($token)
    {
        ResetPasswordNotification::createUrlUsing(function (User $user, string $token) {
            return config('app.front_url').'/reset-password?'.
                http_build_query(['token' => $token, 'email' => $user->getEmailForPasswordReset()]);
        });

        $this->notify(new ResetPasswordNotification($token));
    }

    public function updateLattes(array $data): void
    {
        foreach ($data['productions'] as $productionData) {
            if ($productionData['nature'] !== "COMPLETO") {
                continue;
            }

            // Match production by DOI or by Title + Year
            $doi = $productionData['doi'] ?? null;
            if ($doi === 'http://dx.doi.org/') {
                $doi = null;
                $productionData['doi'] = null;
            }

            if ($doi) {
                $production = Production::updateOrCreate(
                    ['doi' => $doi],
                    $productionData
                );
            } else {
                // If no DOI, match by title and year to avoid overwriting all null-DOI productions
                $production = Production::updateOrCreate(
                    [
                        'title' => $productionData['title'],
                        'year' => (int) $productionData['year'],
                        'doi' => null
                    ],
                    $productionData
                );
            }

            $this->writerOf()->syncWithoutDetaching([$production->id]);
        }
        $this->lattes_xml_uploaded_at = $data['lattes_xml_uploaded_at'] ?? $data['lattes_updated_at'] ?? null;
        $this->save();
    }


    public function programs(): BelongsToMany
    {
        exit('NOT IMPLEMENTED');
    }

    public function course(): BelongsTo
    {
        return $this->belongsTo(Course::class, 'course_id');
    }

    public static function mestrandos(): Builder
    {
        return static::query()->whereHas('course', function ($query) {
            $query->where('name', 'Mestrado');
        });

        //return static::query()
        //    ->join('courses', 'courses.id', '=', 'users.course_id')
        //    ->where('courses.name', 'Mestrado');
    }

    public static function doutorandos(): Builder
    {
        return static::query()->whereHas('course', function ($query) {
            $query->where('name', 'Doutorado');
        });

        //return static::query()
        //    ->join('courses', 'courses.id', '=', 'users.course_id')
        //    ->where('courses.name', 'Doutorado');
    }

    public function scopeOnlyPendingAdminRequest($query)
    {
        return $query->where('admin_status', 'pending');
    }

    public function scopeAnyAdminRequest($query)
    {
        return $query->whereNotNull('admin_status')
                ->where('admin_status', '<>', '');
    }

    public function scopeProfessors($query)
    {
        return $query->where('users.type', UserType::PROFESSOR);
    }

    public function scopeStudents($query)
    {
        return $query->where('users.type', UserType::STUDENT);
    }

    public function scopeOnlyApproved($query)
    {
        return $query->where('is_approved', true);
    }
}
