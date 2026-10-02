<?php

namespace Database\Factories;

use App\Enums\InternationalizationCourse;
use App\Enums\InternationalizationLattesStatus;
use App\Enums\InternationalizationLevel;
use App\Models\InternationalizationCategory;
use Illuminate\Database\Eloquent\Factories\Factory;

class InternationalizationActionFactory extends Factory
{
    public function definition(): array
    {
        $start = $this->faker->dateTimeBetween('-3 years', 'now');

        return [
            'user_id' => null,
            'category_id' => fn () => InternationalizationCategory::query()->inRandomOrder()->value('id')
                ?? InternationalizationCategory::create(['name' => $this->faker->unique()->words(3, true)])->id,
            'full_name' => $this->faker->name(),
            'registration_number' => (string) $this->faker->numberBetween(100000, 999999),
            'level' => $this->faker->randomElement(InternationalizationLevel::values()),
            'course' => $this->faker->randomElement(InternationalizationCourse::values()),
            'lattes_status' => $this->faker->randomElement(InternationalizationLattesStatus::values()),
            'country' => $this->faker->country(),
            'institution' => $this->faker->company(),
            'description' => $this->faker->sentence(14),
            'start_date' => $start->format('Y-m-d'),
            'end_date' => (clone $start)->modify('+10 days')->format('Y-m-d'),
        ];
    }
}
