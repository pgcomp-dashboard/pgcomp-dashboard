<?php

namespace App\Http\Requests\DefenseRequests;

use App\Domain\DefenseRequests\DefenseRequestForms;
use App\Enums\UserType;
use App\Models\DefenseRequest;
use App\Models\User;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

/**
 * Abertura (POST) e revisão pelo orientador (PUT) de uma solicitação de banca.
 *
 * Quem pode (DefenseRequestPolicy): discente (para si, com orientador vinculado) e
 * docente (para o próprio orientando). A coordenação só acompanha pelo /admin. Na
 * revisão, só o orientador atual do discente, enquanto a solicitação aguarda por ele.
 */
class StoreDefenseRequest extends FormRequest
{
    private ?string $denied = null;

    public function authorize(): bool
    {
        // Regras de papel e de estado ficam na DefenseRequestPolicy.
        $reviewing = $this->reviewing();
        $response = $reviewing
            ? Gate::forUser($this->user())->inspect('review', $reviewing)
            : Gate::forUser($this->user())->inspect('create', DefenseRequest::class);
        $this->denied = $response->denied() ? $response->message() : null;

        return $response->allowed();
    }

    protected function failedAuthorization()
    {
        if (! $this->denied) {
            throw new AuthorizationException;
        }

        throw new HttpResponseException(response()->json(['errors' => [['description' => $this->denied]]], 403));
    }

    public function rules(): array
    {
        $type = (string) $this->input('type');
        // As confirmações são do orientador; o discente envia sem elas.
        $withConfirmations = ! $this->isStudent();
        // O docente que abre precisa dizer o discente; na revisão ele já está na solicitação.
        $studentRule = $this->isStudent() || $this->reviewing() ? 'nullable' : 'required';

        return array_merge(
            [
                'type' => ['required', 'string', Rule::in(DefenseRequestForms::types())],
                'data' => ['required', 'array'],
                'student_user_id' => [$studentRule, 'integer', Rule::exists('users', 'id')->where('type', UserType::STUDENT->value)],
            ],
            // Os campos de "data" dependem do tipo escolhido.
            DefenseRequestForms::get($type) ? DefenseRequestForms::rules($type, $withConfirmations) : [],
        );
    }

    public function attributes(): array
    {
        return DefenseRequestForms::attributes((string) $this->input('type')) + ['student_user_id' => 'discente'];
    }

    /** Regras que cruzam o formulário com o cadastro (só rodam se o básico passou). */
    public function after(): array
    {
        return [function (Validator $validator) {
            if ($validator->errors()->isNotEmpty()) {
                return;
            }

            $student = $this->student();
            $type = (string) $this->input('type');

            if ($this->isStudent() && ! $student->advisors()->exists()) {
                $validator->errors()->add('student_user_id', 'Seu cadastro não tem orientador vinculado. Peça à secretaria para vincular antes de abrir a solicitação.');

                return;
            }

            if (! $this->isStudent() && ! $this->reviewing() && ! $student->advisors()->whereKey($this->user()->id)->exists()) {
                $validator->errors()->add('student_user_id', 'Você só pode abrir solicitação para os seus orientandos.');

                return;
            }

            $this->checkLevel($validator, $student, $type);
            $this->checkCommittee($validator, $student, $type);
            // A duplicata é conferida em DefenseRequestWorkflow, dentro da transação com lock.
        }];
    }

    // ---- contexto ---------------------------------------------------------------

    public function isStudent(): bool
    {
        return $this->user()->type === UserType::STUDENT;
    }

    public function reviewing(): ?DefenseRequest
    {
        $route = $this->route('defense_request');

        return $route instanceof DefenseRequest ? $route : null;
    }

    /** Discente da solicitação: quem está logado, o escolhido pelo docente ou o da revisão. */
    public function student(): ?User
    {
        if ($this->isStudent()) {
            return $this->user();
        }

        $id = $this->reviewing() ? $this->reviewing()->student_user_id : $this->input('student_user_id');

        return $id ? User::find($id) : null;
    }

    // ---- regras -----------------------------------------------------------------

    private function checkLevel(Validator $validator, ?User $student, string $type): void
    {
        $level = $student ? DefenseRequestForms::levelOf($student) : null;
        if ($level && DefenseRequestForms::TYPE_MATRIX[$type]['level'] !== $level) {
            $validator->errors()->add('type', "O discente é do {$level}; escolha uma banca de {$level}.");
        }
    }

    /** Ninguém em duas vagas; orientador e coorientador fora; user_id só de docente. */
    private function checkCommittee(Validator $validator, ?User $student, string $type): void
    {
        $data = (array) $this->input('data', []);
        $advisors = $student ? $student->advisors()->get()->concat($student->coadvisors()->get()) : collect();
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
                $validator->errors()->add($attribute, "{$field['label']}: só docentes do cadastro podem ser escolhidos.");

                continue;
            }

            $name = self::normalize($person?->name ?? $value['name']);
            if (($userId && in_array($userId, $advisorIds, true)) || in_array($name, $advisorNames, true)) {
                $validator->errors()->add($attribute, "{$field['label']}: orientador e coorientador já participam e não ocupam vaga da banca.");

                continue;
            }

            $identity = $userId ? "id:{$userId}" : "nome:{$name}";
            $other = $seen[$identity] ?? $seen["nome:{$name}"] ?? null;
            if ($other) {
                $validator->errors()->add($attribute, "{$field['label']}: esta pessoa já está em outra vaga ({$other}).");

                continue;
            }
            $seen[$identity] = $field['label'];
            $seen["nome:{$name}"] = $field['label'];
        }
    }

    private static function normalize(string $name): string
    {
        return mb_strtolower(preg_replace('/\s+/', ' ', trim($name)));
    }
}
