<?php

namespace App\Http\Requests\Admin;

use App\Rules\UniqueUserEmail;
use Illuminate\Foundation\Http\FormRequest;

class StoreUserRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     *
     * @return bool
     */
    public function authorize()
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array
     */
    public function rules()
    {
        return [
            'name' => 'required|string|max:255',
            'email' => ['required', 'string', 'email:rfc', 'max:255', new UniqueUserEmail()],
            'password' => 'required|string|min:8',
            'orcid' => 'nullable|string|max:255',
        ];
    }
}
