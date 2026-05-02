<?php

namespace Database\Factories;

use App\Models\Project;
use Illuminate\Database\Eloquent\Factories\Factory;

class ProjectFactory extends Factory
{
    protected $model = Project::class;

    public function definition(): array
    {
        $startYear = $this->faker->numberBetween(2000, 2023);

        return [
            'name'           => $this->faker->sentence(4),
            'home_page'      => null,
            'start_year'     => $startYear,
            'end_year'       => $this->faker->optional()->numberBetween($startYear, 2025),
            'status'         => $this->faker->randomElement([ 'EM_ANDAMENTO', 'CONCLUIDO' ]),
            'nature'         => $this->faker->randomElement([ 'PESQUISA', 'EXTENSAO' ]),
            'workload'       => null,
            'value'          => null,
            'funding_source' => null,
        ];
    }

    public function emAndamento(): static
    {
        return $this->state(fn() => [ 'status' => 'EM_ANDAMENTO', 'end_year' => null ]);
    }

    public function concluido(): static
    {
        return $this->state(fn() => [ 'status' => 'CONCLUIDO' ]);
    }

    public function internacional(): static
    {
        return $this->state(fn() => [ 'nature' => 'INTERNACIONAL' ]);
    }
}