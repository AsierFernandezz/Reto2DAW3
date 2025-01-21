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
        Schema::create('climas', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('baliza_id');
            $table->decimal('temperatura', 5, 2)->nullable();
            $table->decimal('presion_atmosferica', 6, 2)->nullable();
            $table->decimal('humedad', 5, 2)->nullable();
            $table->decimal('precipitaciones', 5, 2)->nullable();
            $table->decimal('viento', 5, 2)->nullable();
            $table->string('tiempo')->nullable();
            $table->dateTime('fecha')->nullable();
            $table->timestamps();

            $table->foreign('baliza_id')->references('id')->on('baliza');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('climas');
    }
};
