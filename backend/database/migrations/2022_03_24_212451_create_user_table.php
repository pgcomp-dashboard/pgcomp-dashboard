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
        Schema::create('users', function (Blueprint $table) {
            $table->id('id');
            $table->integer('registration')->nullable();
            $table->integer('siape')->unique()->nullable();
            $table->string('name');
            $table->string('type');
            $table->string('area')->nullable();
            $table->unsignedBigInteger('advisor_id')->nullable();
            $table->integer('course_id')->nullable();

            
            $table->timestamps();
        });

        Schema::table('users', function (Blueprint $table) {
            $table->foreign('advisor_id')->references('id')->on('users');
            $table->foreign('course_id')->references('sigaa_id')->on('courses');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('users');
    }

    
};
