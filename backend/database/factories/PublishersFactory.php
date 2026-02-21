<?php

namespace Database\Factories;

use App\Models\Publishers;
use Illuminate\Database\Eloquent\Factories\Factory;

class PublishersFactory extends Factory
{
    protected $model = Publishers::class;

    public function definition(): array
    {
        return [
            'name' => fake()->company(),
            'publisher_type' => fake()->randomElement(['journal', 'conference']),
            'issn' => fake()->optional()->numerify('####-####'),
            'initials' => fake()->optional()->lexify('????'),
        ];
    }
}
