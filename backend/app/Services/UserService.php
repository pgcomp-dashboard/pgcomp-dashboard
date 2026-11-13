<?php

namespace App\Services;

use App\Domain\DefenseRequests\AdvisorLinkGuard;
use App\Enums\UserType;
use App\Models\User;
use App\Models\Production;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Spatie\QueryBuilder\AllowedFilter;
use Spatie\QueryBuilder\QueryBuilder;
use Illuminate\Validation\ValidationException;

class UserService
{
    /**
     * List all users.
     */
    public function listAll()
    {
        return QueryBuilder::for(User::with('secondaryEmail'))
            ->allowedFilters([AllowedFilter::partial('name'), 'type', 'email', 'siape', 'registration', 'category', 'admin_status', 'is_admin', 'is_approved', 'course_id', 'area_id'])
            ->allowedSorts(['name', 'type', 'email', 'siape', 'registration', 'category', 'admin_status', 'is_admin', 'is_approved'])
            ->paginate(request()->input('per_page', 15));
    }

    /**
     * List users pending approval.
     */
    public function listPendingApproval()
    {
        $query = QueryBuilder::for(User::professors()->where('is_approved', false))
            ->allowedFilters(['name', 'email', 'siape', 'category'])
            ->allowedSorts(['name', 'email', 'siape', 'category']);

        if (request()->query('paginate') === 'false') {
            return $query->get();
        }

        return  $query->paginate(request()->input('per_page', 15));
    }

    /**
     * Approve a user.
     */
    public function approve(User $user): User
    {
        if ($user->type !== UserType::PROFESSOR) {
            throw new \InvalidArgumentException('Apenas docentes podem ser aprovados manualmente.');
        }

        $user->is_approved = true;
        $user->save();
        return $user;
    }

    /**
     * Find a user by ID.
     */
    public function find(int $id): User
    {
        return User::with('secondaryEmail')->findOrFail($id);
    }

    /**
     * Store a new user.
     */
    public function store(array $data): User
    {
        if (isset($data['password'])) {
            $data['password'] = Hash::make($data['password']);
        } else {
            $data['password'] = Hash::make(Str::random(12));
        }

        return User::create($data);
    }

    /**
     * Update an existing user.
     */
    public function update(User $user, array $data): User
    {
        $secondaryEmail = $data['secondary_email'] ?? null;
        $hasSecondaryEmail = array_key_exists('secondary_email', $data);
        unset($data['secondary_email']);

        if (isset($data['password']) && !empty($data['password'])) {
            $data['password'] = Hash::make($data['password']);
        } else {
            unset($data['password']);
        }

        if (array_key_exists('type', $data)) {
            $user->type = $data['type'];
            unset($data['type']);
        }

        if (array_key_exists('is_admin', $data)) {
            $isAdmin = $data['is_admin'];

            $user->is_admin = $isAdmin;
            $user->admin_status = $isAdmin ? User::STATUS_APPROVED : User::STATUS_REJECTED;

            unset($data['is_admin'], $data['admin_status']);
        }

        DB::transaction(function () use ($user, $data, $hasSecondaryEmail, $secondaryEmail) {
            $user->fill($data)->save();
            if ($hasSecondaryEmail) {
                if ($secondaryEmail === null || $secondaryEmail === '') {
                    $user->secondaryEmail()->delete();
                } else {
                    $user->secondaryEmail()->updateOrCreate(
                        [],
                        ['email' => strtolower(trim($secondaryEmail))],
                    );
                }
            }
        });

        return $user->load('secondaryEmail');
    }

    /**
     * Delete a user.
     */
    public function delete(User $user): bool
    {
        return DB::transaction(function () use ($user) {
            // Sem deixar solicitação de banca aguardando sem orientador.
            AdvisorLinkGuard::assertProfessorCanLeave($user);

            $user->writerOf()->each(fn($production) => $production->delete());

            $user->advisors()->detach();
            $user->advisedes()->detach();
            $user->coadvisors()->detach();
            $user->coadviseees()->detach();

            return $user->delete();
        });
    }

    /**
     * Create or update a user of type student.
     */
    public function createOrUpdateStudent(array $data): User
    {
        return DB::transaction(function () use ($data) {
            $secondaryEmail = $data['secondary_email'] ?? null;
            unset($data['secondary_email']);
            $user = User::where('registration', $data['registration'])->first();

            if ($user) {
                $user->update($data);
            } else {
                $data['type'] = UserType::STUDENT;
                $data['password'] = Hash::make(Str::random(12));
                $user = User::create($data);
            }

            if ($secondaryEmail !== null && $secondaryEmail !== '') {
                $user->secondaryEmail()->updateOrCreate(
                    [],
                    ['email' => strtolower(trim($secondaryEmail))],
                );
            }

            if (isset($data['advisor_id'])) {
                $this->syncAdvisors($user, array_values(array_filter((array) $data['advisor_id'])));
            }

            return $user->load('secondaryEmail');
        });
    }

    /**
     * Único caminho para trocar os orientadores de um discente (cadastro e importação do SIGAA).
     * Recusa deixar sem orientador quem tem solicitação de banca aguardando (AdvisorLinkGuard).
     *
     * @param  array<int, int>|array<int, array>  $advisors  ids, ou [id => atributos do pivô]
     */
    public function syncAdvisors(User $student, array $advisors): void
    {
        DB::transaction(function () use ($student, $advisors) {
            $ids = collect($advisors)->map(fn ($v, $k) => is_array($v) ? $k : $v)->values()->all();
            AdvisorLinkGuard::assertStudentKeepsAdvisor($student, $ids);
            $student->advisors()->sync($advisors);
        });
    }

    /**
     * Create or update a user of type professor by scraping.
     */
    public function createOrUpdateTeacherByScraping(array $data): User
    {
        $user = User::where('siape', $data['siape'])->first();

        if ($user) {
            $user->update($data);
        } else {
            $data['type'] = UserType::PROFESSOR;
            $data['password'] = Hash::make(Str::random(12));
            $user = User::create($data);
        }

        return $user;
    }

    /**
     * List all professors.
     */
    public function listProfessors()
    {
         $query = QueryBuilder::for(User::professors())
            ->allowedFilters(['name', 'type', 'email', 'siape', 'registration', 'category', 'admin_status', 'is_admin'])
            ->allowedSorts(['name', 'type', 'email', 'siape', 'registration', 'category', 'admin_status', 'is_admin']);

        if (request()->query('paginate') === 'false') {
            return $query->get();
        }

        return $query->paginate(request()->input('per_page', 15));
    }

    /**
     * Find a professor by ID.
     */
    public function findProfessor(int $id): User
    {
        return User::professors()->findOrFail($id);
    }

    /**
     * List all students.
     */
    public function listStudents(array $params = [])
    {
        $query = QueryBuilder::for(User::students()->with('secondaryEmail'))
            ->allowedFilters(['name', 'type', 'email', 'siape', 'registration', 'category', 'admin_status', 'is_admin'])
            ->allowedSorts(['name', 'type', 'email', 'siape', 'registration', 'category', 'admin_status', 'is_admin']);

        if (request()->query('paginate') === 'false') {
            return $query->get();
        }

        return $query->paginate(request()->input('per_page', 15));
    }

    /**
     * Find a student by ID.
     */
    public function findStudent(int $id): User
    {
        return User::students()->with('secondaryEmail')->findOrFail($id);
    }

    /**
     * Alterna o status de destaque (is_featured) de uma produção para um usuário específico na pivot.
     *
     * @throws ValidationException
     */
    public function toggleFeatured(User $user, Production $production): bool
    {
        $associatedProduction = $user->writerOf()->where('productions_id', $production->id)->first();

        if (!$associatedProduction) {
            throw ValidationException::withMessages([
                'production' => 'Esta produção não está vinculada a este autor.',
            ]);
        }

        $currentStatus = (bool) $associatedProduction->pivot->is_featured;
        $newStatus = !$currentStatus;

        if ($newStatus) {
            $totalFeatured = $user->writerOf()
                ->wherePivot('is_featured', true)
                ->count();

            if ($totalFeatured >= 4) {
                throw ValidationException::withMessages([
                    'is_featured' => 'Você já atingiu o limite máximo de 4 produções em destaque.',
                ]);
            }
        }

        $user->writerOf()->updateExistingPivot($production->id, [
            'is_featured' => $newStatus,
        ]);

        return $newStatus;
    }
}
