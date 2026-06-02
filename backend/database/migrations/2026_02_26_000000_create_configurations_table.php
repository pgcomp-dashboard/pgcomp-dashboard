<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('configurations', function (Blueprint $table) {
            $table->id();
            $table->string('group')->index()->comment('Category of the rule');
            $table->string('key')->index()->comment('Identifier of the rule');
            $table->text('value')->nullable();
            $table->string('type')->default('string')->comment('Type for casting: string, integer, boolean, json');
            $table->string('description')->nullable();
            $table->timestamps();

            $table->unique(['group', 'key']);
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('configurations');
    }
};
