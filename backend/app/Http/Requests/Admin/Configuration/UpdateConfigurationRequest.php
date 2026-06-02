<?php

namespace App\Http\Requests\Admin\Configuration;

use Illuminate\Foundation\Http\FormRequest;

class UpdateConfigurationRequest extends FormRequest
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
            'group' => 'sometimes|required|string|max:255',
            'key' => 'sometimes|required|string|max:255',
            'value' => 'nullable|string',
            'type' => 'sometimes|required|string|in:string,integer,float,boolean,json',
            'description' => 'nullable|string|max:1000',
        ];
    }
}
