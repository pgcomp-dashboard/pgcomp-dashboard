<?php

namespace Database\Factories;

use App\Models\Production;
use App\Models\Publishers;
use App\Enums\ProductionSource;
use App\Enums\PublisherType;
use Illuminate\Database\Eloquent\Factories\Factory;

class ProductionFactory extends Factory
{
    protected $model = Production::class;

    public function definition(): array
    {
        return [
            'title' => fake()->sentence(),
            'year' => fake()->year(),
            'publisher_type' => fake()->randomElement(PublisherType::cases()),
            'publisher_id' => Publishers::factory(),
            'source' => ProductionSource::XML,
            'nature' => 'COMPLETO',
        ];
    }
}
