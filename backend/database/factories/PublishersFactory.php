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
            'initials' => fake()->optional()->lexify('????'),
        ];
    }

    public function configure()
    {
        return $this->afterCreating(function (Publishers $publisher) {
            // Give it an ISSN 80% of the time
            if (fake()->boolean(80)) {
                $publisher->issns()->create([
                    'issn' => fake()->numerify('####-####')
                ]);
            }
        });
    }
}
