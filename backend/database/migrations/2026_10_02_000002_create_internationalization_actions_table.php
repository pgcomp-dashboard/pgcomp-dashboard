<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('internationalization_actions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('category_id')
                ->constrained('internationalization_categories')
                ->restrictOnDelete();
            $table->string('full_name');
            $table->string('registration_number', 50);
            $table->string('level');
            $table->string('course');
            $table->string('lattes_status');
            $table->string('advisor_name')->nullable();
            $table->string('country')->nullable();
            $table->string('institution')->nullable();
            $table->string('foreign_research_group')->nullable();
            $table->string('foreign_researcher')->nullable();
            $table->text('description');
            $table->date('start_date')->index();
            $table->date('end_date');
            $table->string('call_notice')->nullable();
            $table->string('url', 2048)->nullable();
            $table->timestamps();
        });

        Schema::create('internationalization_files', function (Blueprint $table) {
            $table->id();
            $table->foreignId('action_id')
                ->constrained('internationalization_actions')
                ->cascadeOnDelete();
            $table->string('slot', 20);
            $table->string('path');
            $table->string('name');
            $table->timestamps();

            $table->unique(['action_id', 'slot'], 'intl_files_action_slot_unique');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('internationalization_files');
        Schema::dropIfExists('internationalization_actions');
    }
};
