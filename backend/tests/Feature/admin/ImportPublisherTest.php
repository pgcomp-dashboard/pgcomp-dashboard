<?php

namespace Tests\Feature\Admin;

use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;
use App\Models\Publishers;
use App\Enums\PublisherType;
use Mockery;
use App\Domain\Qualis\ConferenceQualisXLSX;
use App\Domain\Qualis\JournalQualisXLSX;

class ImportPublisherTest extends TestCase
{
    use DatabaseTransactions;

    protected function authenticateAdmin()
    {
        $user = User::factory()->create([
            'is_admin' => true,
        ]);
        $this->actingAs($user);
        return $user;
    }

    public function test_import_validation_fails_without_file()
    {
        $this->authenticateAdmin();

        $response = $this->postJson('/api/admin/publishers/import', [
            'type' => 'conference'
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['file']);
    }

    public function test_import_validation_fails_without_type()
    {
        $this->authenticateAdmin();

        $file = UploadedFile::fake()->create('conferences.xlsx', 100, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

        $response = $this->postJson('/api/admin/publishers/import', [
            'file' => $file
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['type']);
    }

    public function test_import_validation_fails_with_invalid_type()
    {
        $this->authenticateAdmin();

        $file = UploadedFile::fake()->create('conferences.xlsx', 100, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

        $response = $this->postJson('/api/admin/publishers/import', [
            'file' => $file,
            'type' => 'invalid_type'
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['type']);
    }

    /**
     * @runInSeparateProcess
     * @preserveGlobalState disabled
     */
    public function test_import_conference_success()
    {
        $this->authenticateAdmin();
        Storage::fake('local');

        // Mock the extractor
        $mock = Mockery::mock('alias:' . ConferenceQualisXLSX::class);
        $mock->shouldReceive('extractConferenceQualis')
            ->once()
            ->andReturn([
                ['CONF1', 'Conference 1', 'A1'],
                ['CONF2', 'Conference 2', 'B1']
            ]);

        $file = UploadedFile::fake()->create('conferences.xlsx', 100, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

        $response = $this->postJson('/api/admin/publishers/import', [
            'file' => $file,
            'type' => 'conference'
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'status' => 200,
                'message' => 'Planilha de Conferências importada com sucesso'
            ]);

        $this->assertDatabaseHas('publishers', [
            'initials' => 'CONF1',
            'name' => 'Conference 1',
            'publisher_type' => PublisherType::CONFERENCE->value
        ]);
    }

    /**
     * @runInSeparateProcess
     * @preserveGlobalState disabled
     */
    public function test_import_journal_success()
    {
        $this->authenticateAdmin();
        Storage::fake('local');

        // Mock the extractor
        $mock = Mockery::mock('alias:' . JournalQualisXLSX::class);
        $mock->shouldReceive('extractJournalQualis')
            ->once()
            ->andReturn([
                ['1234-5678', 'Journal 1', 'A2'],
                ['9876-5432', 'Journal 2', 'B2']
            ]);

        $file = UploadedFile::fake()->create('journals.xlsx', 100, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

        $response = $this->postJson('/api/admin/publishers/import', [
            'file' => $file,
            'type' => 'journal'
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'status' => 200,
                'message' => 'Planilha de Revistas importada com sucesso'
            ]);

        $this->assertDatabaseHas('publishers', [
            'name' => 'Journal 1',
            'publisher_type' => PublisherType::JOURNAL->value
        ]);

        $this->assertDatabaseHas('publisher_issns', [
            'issn' => '12345678', // hyphen removed in controller
        ]);
    }
}
