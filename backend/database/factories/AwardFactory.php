<?php

namespace Database\Factories;

use App\Enums\AwardScope;
use App\Models\AwardCategory;
use Illuminate\Database\Eloquent\Factories\Factory;

class AwardFactory extends Factory
{
    public function definition(): array
    {
        return [
            'user_id' => null,
            'year' => $this->faker->numberBetween(2018, (int) date('Y')),
            'scope' => $this->faker->randomElement(AwardScope::values()),
            'award_category_id' => fn () => AwardCategory::query()->inRandomOrder()->value('id')
                ?? AwardCategory::create(['name' => $this->faker->unique()->words(3, true)])->id,
            'description' => $this->faker->sentence(12),
            'url' => null,
            'attachment_path' => null,
            'attachment_name' => null,
        ];
    }
}
