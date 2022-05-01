<?php

namespace Tests\Unit;


use App\Models\Area;
use App\Models\Program;
use App\Models\User;
use Tests\TestCase;
use App\Models\Subarea;
use ReflectionClass;

class ControllerSubAreaTest extends TestCase
{
    public function test_createSubarea_syntax()
    {
        $scraping = new ReflectionClass(Subarea::class);
        $method = $scraping->getMethod('updateOrCreate');
        $area = new Subarea();

        $values = [
            // Exceptions
            ['arg' => ['subarea_name' => 'Teoria os Gráfos', 'area_id' => 1], 'return' => true],
            ['arg' => ['subarea_name' => 'Ló#@gica', 'area_id' => 1], 'return' => true],
            ['arg' => ['subarea_name' => 'Teoria dos Grafos', 'area_id' => 1], 'return' => true],
            //['arg' => ['area_name' => '😽', 'program_id' => 1], 'return' => false],
           // ['arg' => ['area_name' => 'joaocarlos@gmail.com', 'program_id' => 1], 'return' => false],

        ];

        foreach($values as $value) {
            $this->assertEquals(
                $method->invoke($area, $value['arg'])->getIncrementing(), $value['return']
            );
        }
     }

     public function test_createSubarea_exception()
    {
        $scraping = new ReflectionClass(Subarea::class);
        $method = $scraping->getMethod('updateOrCreate');
        $area = new Subarea();

        $values = [
            // Exceptions
            ['arg' => ['subarea_name' => 'Teoria os Gráfos', 'area_id' =>-1], 'return' => true],
            ['arg' => ['subarea_name' => 'Teoria os Gráfos'], 'return' => true],
            ['arg' => ['area_id' => 1], 'return' => true],
            ['arg' => [], 'return' => true],

        ];
        $this->expectExceptionMessage('O campo area id selecionado é inválido.');

        foreach($values as $value) {
            $this->assertEquals(
                $method->invoke($area, $value['arg'])->getIncrementing(), $value['return']
            );
        }
     }

     public function test_view_Subarea()
     {
         $program = Program::create(['sigaa_id' => random_int(9999, 999999), 'name' => 'Program 1']);
         $area = Area::create(['program_id' => $program->id, 'area_name' => 'Teste Area 1']);
         $subAreaData = ['subarea_name' => 'teste1', 'area_id' => $area->id];
         $subarea = Subarea::create($subAreaData);

         $user = new User();
         $user->is_admin = true;
         $data = $this->actingAs($user)->get('api/portal/admin/subareas/' . $subarea->id);

         $data->assertJson($subAreaData);
      }

      public function test_remove_Subarea()
      {
          $scraping = new ReflectionClass(Subarea::class);
          $method = $scraping->getMethod('deleteSubareaByName');
          $area = new Subarea();


          $area->createOrUpdateSubarea(['subarea_name' => "Area_1", "area_id"=> 1]);

          $values = [
              // Exception
              ['arg' => 'Area_1', 'return' => true],
              //['arg' => 'Area_300', 'return' => false],
          ];

          foreach($values as $value) {
              $this->assertEquals(
                  $method->invoke($area, $value['arg']), $value['return']
              );
          }
       }
}
