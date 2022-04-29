<?php

namespace Tests\Unit;


use Tests\TestCase;
use App\Models\Subarea;
use ReflectionClass;

class ControllerSubAreaTest extends TestCase
{
    public function test_createSubarea_syntax()
    {
        $scraping = new ReflectionClass(Subarea::class);
        $method = $scraping->getMethod('createOrUpdateSubarea');
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
        $method = $scraping->getMethod('createOrUpdateSubarea');
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
         $scraping = new ReflectionClass(Subarea::class);
         $method = $scraping->getMethod('findSubarea');
         $area = new Subarea();
 
         $values = [
             // Exceptions
             ['arg' => 1, 'return' => 1],
             ['arg' => 2, 'return' => 2],
             //['arg' => 4, 'return' => 4],
             ['arg' => 3, 'return' => 3],
            // ['arg' => 1 + 5 / 2, 'return' => 5 + 1 / 2],
            // ['arg' => 10000, 'return' => 10000], //Exception
            // ['arg' => -1, 'return' => -1],
             
         ];
 
         foreach($values as $value) {
             $this->assertEquals(
                 $method->invoke($area, $value['arg'])['id'], $value['return']
             );
         }
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
