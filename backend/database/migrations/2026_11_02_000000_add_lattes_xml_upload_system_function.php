<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::table('configurations')->updateOrInsert(
            [
                'group' => 'system_functions',
                'key' => 'lattes_xml_upload',
            ],
            [
                'value' => '1',
                'type' => 'boolean',
                'description' => 'Permite que usuários discentes enviem o XML do Lattes.',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        );
    }

    public function down(): void
    {
        DB::table('configurations')
            ->where('group', 'system_functions')
            ->where('key', 'lattes_xml_upload')
            ->delete();
    }
};
