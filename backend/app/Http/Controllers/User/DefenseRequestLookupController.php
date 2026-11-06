<?php

namespace App\Http\Controllers\User;

use App\Domain\DefenseRequests\DefenseRequestForms;
use App\Enums\UserType;
use App\Http\Controllers\Controller;
use App\Models\DefenseRequest;
use App\Models\User;
use Illuminate\Http\Request;

/**
 * POC: buscas que deixam o wizard de banca quase sem digitação.
 * - students: o próprio discente, ou os orientandos do docente, com nível (pelo curso),
 *   orientador e coorientador já vinculados.
 * - members: docentes do PGCOMP (afiliação e Lattes do cadastro) e membros externos
 *   que já participaram de outras bancas no portal.
 */
class DefenseRequestLookupController extends Controller
{
    public const INTERNAL_AFFILIATION = 'PGCOMP/UFBA';

    public function students(Request $request)
    {
        $me = $request->user();

        // O discente só pode abrir solicitação para si mesmo.
        if ($me->type === UserType::STUDENT) {
            return response()->json(['data' => [$this->studentPayload($me->load(['course', 'advisors', 'coadvisors']), $me)]]);
        }

        // O docente só abre para os próprios orientandos; a busca filtra entre eles.
        $q = trim((string) $request->query('q', ''));
        $students = $me->advisedes()
            ->where('users.type', UserType::STUDENT)
            ->whereNull('users.defended_at')
            ->with(['course', 'advisors', 'coadvisors'])
            ->when($q !== '', fn ($query) => $query->where('users.name', 'like', '%'.addcslashes($q, '%_\\').'%'))
            ->orderBy('users.name')
            ->limit(50)
            ->get();

        return response()->json(['data' => $students->map(fn (User $s) => $this->studentPayload($s, $me))]);
    }

    public function members(Request $request)
    {
        $q = trim((string) $request->query('q', ''));
        $matches = fn (string $name) => $q === '' || mb_stripos($name, $q) !== false;

        $professors = User::query()
            ->where('type', UserType::PROFESSOR)
            ->when($q !== '', fn ($query) => $query->where('name', 'like', "%{$q}%"))
            ->orderBy('name')
            ->limit(15)
            ->get()
            ->map(fn (User $u) => [
                'user_id' => $u->id,
                'name' => $u->name,
                'affiliation' => self::INTERNAL_AFFILIATION,
                'lattes' => $u->lattes_url,
                'source' => 'pgcomp',
            ]);

        // Externos que já estiveram em outras bancas: o nome traz afiliação e Lattes.
        $previous = DefenseRequest::query()
            ->latest('id')
            ->limit(300)
            ->pluck('data')
            ->flatMap(fn ($data) => collect($data)->filter(fn ($v) => is_array($v) && empty($v['user_id']) && ! empty($v['name'])))
            ->filter(fn ($m) => $matches($m['name']))
            ->unique(fn ($m) => mb_strtolower($m['name']))
            ->take(10)
            ->map(fn ($m) => [
                'user_id' => null,
                'name' => $m['name'],
                'affiliation' => $m['affiliation'] ?? '',
                'lattes' => $m['lattes'] ?? null,
                'source' => 'previous',
            ])
            ->values();

        return response()->json(['data' => $professors->concat($previous)->values()]);
    }

    private function studentPayload(User $student, User $me): array
    {
        $person = fn (?User $u) => $u ? ['id' => $u->id, 'name' => $u->name] : null;
        return [
            'id' => $student->id,
            'name' => $student->name,
            'registration' => $student->registration,
            'level' => DefenseRequestForms::levelOf($student),
            'advisor' => $person($student->advisors->first()),
            'co_advisor' => $person($student->coadvisors->first()),
            'is_mine' => $student->advisors->contains('id', $me->id),
        ];
    }
}
