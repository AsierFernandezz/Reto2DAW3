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
        Schema::create('baliza', function (Blueprint $table) {
            $table->id();
            $table->string('latitud', 20);
            $table->string('longitud', 20);
            $table->string('municipio', 50);
            $table->string('id_aemet', 50);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('baliza');
    }
};
