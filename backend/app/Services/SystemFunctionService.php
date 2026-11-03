<?php

namespace App\Services;

use App\Models\Configuration;

class SystemFunctionService
{
    public const LATTES_XML_UPLOAD_KEY = 'lattes_xml_upload';
    public const LATTES_XML_UPLOAD_DISABLED_MESSAGE = 'Não é possível enviar o xml agora, a função foi desabilitada';

    public function isLattesXmlUploadEnabled(): bool
    {
        return (bool) Configuration::get(
            'system_functions',
            self::LATTES_XML_UPLOAD_KEY,
            true,
        );
    }

    public function setLattesXmlUploadEnabled(bool $enabled): void
    {
        Configuration::set(
            'system_functions',
            self::LATTES_XML_UPLOAD_KEY,
            $enabled,
            'boolean',
        );
    }
}
