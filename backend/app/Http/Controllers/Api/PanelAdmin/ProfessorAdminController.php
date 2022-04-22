<?php

namespace App\Http\Controllers\Api\PanelAdmin;

use App\Enums\UserType;

class ProfessorAdminController extends UsersAdminController
{
    function __construct()
    {
        parent::__construct(UserType::PROFESSOR->value,
            "Invalid professor user",
            ["field" => "type", "value" => "professor", "operator" => "="]);
    }
}
