<?php

namespace Tests\Feature;

use App\Models\User;
use App\Services\SystemFunctionService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Tests\TestCase;

class SystemFunctionTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_disable_discente_lattes_xml_upload(): void
    {
        $admin = User::factory()->admin()->create(['is_approved' => true]);
        $student = User::factory()->create([
            'is_approved' => true,
            'type' => 'student',
        ]);

        $this->actingAs($admin)
            ->getJson('/api/admin/system-functions')
            ->assertOk()
            ->assertJsonPath('data.0.key', 'lattes_xml_upload')
            ->assertJsonPath('data.0.enabled', true);

        $this->actingAs($admin)
            ->putJson('/api/admin/system-functions/lattes-xml-upload', [
                'enabled' => false,
            ])
            ->assertOk()
            ->assertJsonPath('data.enabled', false);

        $this->actingAs($student)
            ->getJson('/api/portal/system-functions/lattes-xml-upload')
            ->assertOk()
            ->assertJsonPath('enabled', false);

        $this->actingAs($student)
            ->post('/api/portal/lattes-update', [
                'file' => UploadedFile::fake()->create(
                    'curriculo.xml',
                    10,
                    'application/xml',
                ),
            ], ['Accept' => 'application/json'])
            ->assertForbidden()
            ->assertJsonPath(
                'message',
                SystemFunctionService::LATTES_XML_UPLOAD_DISABLED_MESSAGE,
            );
    }

    public function test_system_function_administration_requires_an_admin(): void
    {
        $student = User::factory()->create([
            'is_approved' => true,
            'type' => 'student',
        ]);

        $this->actingAs($student)
            ->getJson('/api/admin/system-functions')
            ->assertForbidden();

        $this->actingAs($student)
            ->putJson('/api/admin/system-functions/lattes-xml-upload', [
                'enabled' => false,
            ])
            ->assertForbidden();
    }
}
