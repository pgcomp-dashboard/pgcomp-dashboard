<?php

namespace Tests\Unit;

use App\Models\Area;
use App\Models\Program;
use App\Models\User;
use ReflectionClass;
use Tests\TestCase;

class ControllerAreaTest extends TestCase
{
    public function test_createArea_syntax()
    {
        $scraping = new ReflectionClass(Area::class);
        $method = $scraping->getMethod('createOrUpdateArea');
        $area = new Area();

        $values = [
            // Exceptions
            ['arg' => ['area_name' => 'Teoria os Gráfos', 'program_id' => 1], 'return' => true],
            ['arg' => ['area_name' => 'Ló#@gica', 'program_id' => 1], 'return' => true],
            ['arg' => ['area_name' => 'Teoria dos Grafos', 'program_id' => 1], 'return' => true],
            //['arg' => ['area_name' => '😽', 'program_id' => 1], 'return' => false],
            // ['arg' => ['area_name' => 'joaocarlos@gmail.com', 'program_id' => 1], 'return' => false],

        ];

        foreach ($values as $value) {
            $this->assertEquals(
                $method->invoke($area, $value['arg'])->getIncrementing(), $value['return']
            );
        }
    }

    public function test_createArea_exception()
    {
        $scraping = new ReflectionClass(Area::class);
        $method = $scraping->getMethod('createOrUpdateArea');
        $area = new Area();

        $values = [
            // Exceptions
            ['arg' => ['area_name' => 'Teoria os Gráfos', 'program_id' => -1], 'return' => true],
            ['arg' => ['area_name' => 'Teoria os Gráfos'], 'return' => true],
            ['arg' => ['program_id' => 1], 'return' => true],
            ['arg' => [], 'return' => true],

        ];
        $this->expectExceptionMessage('O campo program id selecionado é inválido.');

        foreach ($values as $value) {
            $this->assertEquals(
                $method->invoke($area, $value['arg'])->getIncrementing(), $value['return']
            );
        }
    }

    public function test_view_area()
    {
        $area = $this->createArea();

        $data = $this->get('api/portal/admin/areas/' . $area->id);

        $data->assertJson($area->toArray());
    }

    public function test_remove_area()
    {
        $area = $this->createArea();

        $data = $this->delete('api/portal/admin/areas/' . $area->id);
        $data->assertStatus(200);

        $data = $this->get('api/portal/admin/areas/' . $area->id);
        $data->assertStatus(404);
    }

    protected function setUp(): void
    {
        parent::setUp();

        $user = new User();
        $user->is_admin = true;

        $this->actingAs($user); // use api as admin user.
    }

    protected function createArea(): Area
    {
        $program = Program::create(['sigaa_id' => random_int(9999, 999999), 'name' => 'Program 1']);
        return Area::create(['program_id' => $program->id, 'area_name' => 'Teste Area 1']);
    }
}
