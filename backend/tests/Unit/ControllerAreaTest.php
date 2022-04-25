<?php

namespace Tests\Unit;

use Tests\TestCase;
use App\Models\Area;
use ReflectionClass;

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
       
        foreach($values as $value) {
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
            ['arg' => ['area_name' => 'Teoria os Gráfos', 'program_id' =>-1], 'return' => true],
            ['arg' => ['area_name' => 'Teoria os Gráfos'], 'return' => true],
            ['arg' => ['program_id' => 1], 'return' => true],
            ['arg' => [], 'return' => true],
            
        ];
        $this->expectExceptionMessage('O campo program id selecionado é inválido.');

        foreach($values as $value) {
            $this->assertEquals(
                $method->invoke($area, $value['arg'])->getIncrementing(), $value['return']
            );
        }
     }

     public function test_view_area()
     {
         $scraping = new ReflectionClass(Area::class);
         $method = $scraping->getMethod('findArea');
         $area = new Area();
 
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

      public function test_remove_area()
      {
          $scraping = new ReflectionClass(Area::class);
          $method = $scraping->getMethod('deleteAreaByName');
          $area = new Area();
        

          $area->createOrUpdateArea(['area_name' => "Area_1", "program_id"=> 1]);

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
