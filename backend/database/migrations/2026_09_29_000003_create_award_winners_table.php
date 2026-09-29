<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('award_winners', function (Blueprint $table) {
            $table->id();
            $table->foreignId('award_id')->constrained('awards')->cascadeOnDelete();
            $table->string('name');
            $table->string('recipient_type');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('award_winners');
    }
};
