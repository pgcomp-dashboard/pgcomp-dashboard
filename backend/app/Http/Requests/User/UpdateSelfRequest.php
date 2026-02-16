<?php

namespace App\Http\Requests\User;

use App\Models\Area;
use App\Models\Course;
use App\Models\User;
use App\Enums\UserType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateSelfRequest extends FormRequest
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
        $user = $this->user();

        $courseIdRules = [
            'int',
            Rule::exists(Course::class, 'id'),
        ];
        if ($user->type === UserType::PROFESSOR) {
            $courseIdRules[] = 'nullable';
        }

        return [
            'name' => 'string|max:255',
            'email' => [
                'nullable',
                'string',
                'email',
                'max:255',
                Rule::unique(User::class)->ignore($user->id),
            ],
            'area_id' => [
                'nullable',
                'int',
                Rule::exists(Area::class, 'id'),
            ],
            'course_id' => $courseIdRules,
            'lattes_url' => 'nullable|string|max:255',
        ];
    }
}
