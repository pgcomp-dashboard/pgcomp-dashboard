<?php

namespace Database\Factories;

use App\Models\StratumQualis;
use Illuminate\Database\Eloquent\Factories\Factory;

class StratumQualisFactory extends Factory
{
    protected $model = StratumQualis::class;

    public function definition(): array
    {
        return [
            'code' => $this->faker->randomElement(['A1', 'A2', 'A3', 'A4', 'B1', 'B2', 'B3', 'B4', '-']),
            'score' => $this->faker->numberBetween(0, 100),
        ];
    }
}
