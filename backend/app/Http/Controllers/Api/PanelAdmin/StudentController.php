<?php

namespace App\Http\Controllers\Api\PanelAdmin;

use App\Enums\UserType;

class StudentController extends UsersController {

    function __construct()
    {
        parent::__construct(UserType::STUDENT->value,
            "Invalid student user",
            ["field" => "type", "value" => "student", "operator" => "="]);
    }

}
