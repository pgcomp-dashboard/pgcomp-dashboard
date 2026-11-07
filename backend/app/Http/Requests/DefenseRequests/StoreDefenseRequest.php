<?php

namespace App\Http\Requests\DefenseRequests;

use App\Domain\DefenseRequests\DefenseRequestForms;
use App\Domain\DefenseRequests\DefenseRequestRules;
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
            if ($validator->errors()->isNotEmpty() || ! ($student = $this->student())) {
                return;
            }

            // Resposta rápida; o DefenseRequestWorkflow confere de novo dentro do lock.
            $type = (string) $this->input('type');
            $data = (array) $this->input('data', []);
            $errors = $this->reviewing()
                ? DefenseRequestRules::forReview($student, $type, $data)
                : DefenseRequestRules::forOpen($this->user(), $student, $type, $data);
            foreach ($errors as [$attribute, $message]) {
                $validator->errors()->add($attribute, $message);
            }
            // A duplicata é conferida só no workflow, dentro da transação com lock.
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
}
