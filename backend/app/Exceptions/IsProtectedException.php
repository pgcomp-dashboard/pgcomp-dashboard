<?php
namespace App\Exceptions;

use Exception;

class IsProtectedException extends Exception
{
    public function render()
    {
        return 'Ação não permitida em usuarios protegidos';
    }
}
