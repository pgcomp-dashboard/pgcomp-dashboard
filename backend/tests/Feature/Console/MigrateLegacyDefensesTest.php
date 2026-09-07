<?php

namespace Tests\Feature\Console;

use App\Enums\UserType;
use App\Models\Course;
use App\Models\Defense;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MigrateLegacyDefensesTest extends TestCase
{
    use RefreshDatabase;

    private function student(?int $courseId, ?string $defendedAt): User
    {
        return User::factory()->create([
            'type' => UserType::STUDENT,
            'course_id' => $courseId,
            'defended_at' => $defendedAt,
        ]);
    }

    public function test_copies_legacy_defended_at_into_the_defenses_table()
    {
        $mestrado = Course::create(['name' => 'Mestrado']);
        $doutorado = Course::create(['name' => 'Doutorado']);

        $master = $this->student($mestrado->id, '2022-05-10');
        $phd = $this->student($doutorado->id, '2023-11-20');
        $active = $this->student($mestrado->id, null);

        $this->artisan('defenses:migrate-legacy')->assertSuccessful();

        $this->assertDatabaseHas('defenses', [
            'user_id' => $master->id,
            'course_id' => $mestrado->id,
            'type' => 'mestrado',
        ]);
        $this->assertDatabaseHas('defenses', [
            'user_id' => $phd->id,
            'course_id' => $doutorado->id,
            'type' => 'doutorado',
        ]);
        $this->assertDatabaseMissing('defenses', ['user_id' => $active->id]);
        $this->assertSame('2022-05-10', $master->defenses()->first()->defended_at->toDateString());
    }

    public function test_keeps_the_legacy_column_untouched()
    {
        $course = Course::create(['name' => 'Mestrado']);
        $student = $this->student($course->id, '2021-02-01');

        $this->artisan('defenses:migrate-legacy')->assertSuccessful();

        $this->assertDatabaseHas('users', [
            'id' => $student->id,
            'defended_at' => '2021-02-01',
        ]);
    }

    public function test_migrates_students_without_course_with_null_type()
    {
        $student = $this->student(null, '2020-07-15');

        $this->artisan('defenses:migrate-legacy')->assertSuccessful();

        $this->assertDatabaseHas('defenses', [
            'user_id' => $student->id,
            'course_id' => null,
            'type' => null,
        ]);
    }

    public function test_is_idempotent()
    {
        $course = Course::create(['name' => 'Doutorado']);
        $student = $this->student($course->id, '2024-03-03');

        $this->artisan('defenses:migrate-legacy')->assertSuccessful();
        $this->artisan('defenses:migrate-legacy')->assertSuccessful();

        $this->assertSame(1, Defense::where('user_id', $student->id)->count());
    }

    public function test_dry_run_does_not_write()
    {
        $course = Course::create(['name' => 'Mestrado']);
        $this->student($course->id, '2019-09-09');

        $this->artisan('defenses:migrate-legacy --dry-run')->assertSuccessful();

        $this->assertDatabaseCount('defenses', 0);
    }
}
