<?php

namespace App\Http\Requests\Admin\Configuration;

use Illuminate\Foundation\Http\FormRequest;

class StoreConfigurationRequest extends FormRequest
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
            'group' => 'required|string|max:255',
            'key' => 'required|string|max:255',
            'value' => 'nullable|string',
            'type' => 'required|string|in:string,integer,float,boolean,json',
            'description' => 'nullable|string|max:1000',
        ];
    }
}
