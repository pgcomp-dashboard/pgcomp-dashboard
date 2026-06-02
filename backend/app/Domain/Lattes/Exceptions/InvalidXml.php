<?php

namespace App\Domain\Lattes\Exceptions;

use Exception;
use LibXMLError;

class InvalidXml extends Exception
{
    /**
     * @param array|LibXMLError[] $errors
     */
    public function __construct(protected array $errors)
    {
        parent::__construct('Invalid xml file.');
    }

    public function getErrors(): array
    {
        return $this->errors;
    }
}
