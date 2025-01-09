<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('datos_meteorologicos', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('baliza_id');
            $table->decimal('precipitacion', 5, 2)->nullable();
            $table->decimal('humedad', 5, 2)->nullable();
            $table->decimal('velocidad_viento', 5, 2)->nullable();
            $table->string('direccion_viento')->nullable();
            $table->timestamps();

            $table->foreign('baliza_id')->references('id')->on('baliza');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('datos_meteorologicos');
    }
};
