<?php

namespace App\Http\Controllers\Api\PanelAdmin;

use App\Enums\UserType;

class ProfessorController extends UsersController
{
    function __construct()
    {
        parent::__construct(UserType::PROFESSOR->value,
            "Invalid professor user",
            ["field" => "type", "value" => "professor", "operator" => "="]);
    }
}
