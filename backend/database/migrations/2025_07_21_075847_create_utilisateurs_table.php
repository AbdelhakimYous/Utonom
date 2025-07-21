<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateUtilisateursTable extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('utilisateurs', function (Blueprint $table) {
            $table->id(); // id AUTO_INCREMENT
            $table->string('nom', 50);
            $table->string('prenom', 50);
            $table->string('email', 50)->unique(); // Index + unique
            $table->string('motdepasse', 150);
            $table->string('nomUtilisateur', 255);
            $table->integer('age');
            $table->string('role', 255)->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('utilisateurs');
    }
}
