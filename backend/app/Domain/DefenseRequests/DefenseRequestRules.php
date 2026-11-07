<?php

namespace App\Domain\DefenseRequests;

use App\Enums\UserType;
use App\Models\User;
use Illuminate\Validation\ValidationException;

/**
 * Regras de conteúdo da solicitação de banca. Rodam duas vezes: no StoreDefenseRequest
 * (resposta rápida na tela) e no DefenseRequestWorkflow, dentro da transação com lock,
 * que é a conferência que vale (o cadastro pode ter mudado entre as duas).
 *
 * Cada regra devolve uma lista de [campo, mensagem]; vazia = ok.
 */
class DefenseRequestRules
{
    /** Discente com orientador; docente só para o próprio orientando. Não vale na revisão. */
    public static function opening(User $actor, User $student): array
    {
        if ($actor->type === UserType::STUDENT) {
            return $student->advisors()->exists() ? [] : [[
                'student_user_id',
                'Seu cadastro não tem orientador vinculado. Peça à secretaria para vincular antes de abrir a solicitação.',
            ]];
        }

        return $student->advisors()->whereKey($actor->id)->exists() ? [] : [[
            'student_user_id',
            'Você só pode abrir solicitação para os seus orientandos.',
        ]];
    }

    /** O tipo de banca precisa ser do nível do curso do discente. */
    public static function level(User $student, string $type): array
    {
        $level = DefenseRequestForms::levelOf($student);
        if ($level && DefenseRequestForms::TYPE_MATRIX[$type]['level'] !== $level) {
            return [['type', "O discente é do {$level}; escolha uma banca de {$level}."]];
        }

        return [];
    }

    /** Ninguém em duas vagas; orientador e coorientador fora; user_id só de docente. */
    public static function committee(User $student, string $type, array $data): array
    {
        $errors = [];
        $advisors = $student->advisors()->get()->concat($student->coadvisors()->get());
        $advisorIds = $advisors->pluck('id')->all();
        $advisorNames = $advisors->map(fn (User $u) => self::normalize($u->name))->all();

        $members = collect(DefenseRequestForms::get($type)['fields'])
            ->where('type', 'member')
            ->filter(fn ($f) => is_array($data[$f['key']] ?? null) && trim((string) ($data[$f['key']]['name'] ?? '')) !== '');

        $professors = User::query()
            ->whereIn('id', $members->map(fn ($f) => $data[$f['key']]['user_id'] ?? null)->filter()->all())
            ->get()->keyBy('id');

        $seen = [];
        foreach ($members as $field) {
            $value = $data[$field['key']];
            $userId = isset($value['user_id']) ? (int) $value['user_id'] : null;
            $person = $userId ? $professors->get($userId) : null;
            $attribute = "data.{$field['key']}";

            if ($userId && $person?->type !== UserType::PROFESSOR) {
                $errors[] = [$attribute, "{$field['label']}: só docentes do cadastro podem ser escolhidos."];

                continue;
            }

            $name = self::normalize($person?->name ?? $value['name']);
            if (($userId && in_array($userId, $advisorIds, true)) || in_array($name, $advisorNames, true)) {
                $errors[] = [$attribute, "{$field['label']}: orientador e coorientador já participam e não ocupam vaga da banca."];

                continue;
            }

            $identity = $userId ? "id:{$userId}" : "nome:{$name}";
            $other = $seen[$identity] ?? $seen["nome:{$name}"] ?? null;
            if ($other) {
                $errors[] = [$attribute, "{$field['label']}: esta pessoa já está em outra vaga ({$other})."];

                continue;
            }
            $seen[$identity] = $field['label'];
            $seen["nome:{$name}"] = $field['label'];
        }

        return $errors;
    }

    /** Abertura: acesso primeiro (se falhar, o resto não importa), depois nível e banca. */
    public static function forOpen(User $actor, User $student, string $type, array $data): array
    {
        return self::opening($actor, $student) ?: [...self::level($student, $type), ...self::committee($student, $type, $data)];
    }

    /** Revisão pelo orientador: nível e banca (o acesso é da policy). */
    public static function forReview(User $student, string $type, array $data): array
    {
        return [...self::level($student, $type), ...self::committee($student, $type, $data)];
    }

    public static function assert(array $errors): void
    {
        if ($errors === []) {
            return;
        }
        $messages = [];
        foreach ($errors as [$attribute, $message]) {
            $messages[$attribute][] = $message;
        }

        throw ValidationException::withMessages($messages);
    }

    private static function normalize(string $name): string
    {
        return mb_strtolower(preg_replace('/\s+/', ' ', trim($name)));
    }
}
