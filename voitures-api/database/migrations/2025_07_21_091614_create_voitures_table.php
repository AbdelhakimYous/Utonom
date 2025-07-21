<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateVoituresTable extends Migration
{
    public function up()
    {
        Schema::create('voitures', function (Blueprint $table) {
            $table->increments('id');                      // id primaire auto-increment
            $table->string('modele', 100)->nullable();    // modele varchar(100) nullable
            $table->string('marque', 100)->nullable();    // marque varchar(100) nullable
            $table->string('immatriculation', 50)->nullable()->index(); // immatriculation varchar(50) nullable + index
            $table->double('latitude');                    // latitude double NOT NULL
            $table->double('longitude');                   // longitude double NOT NULL
            $table->boolean('disponible')->default(false)->nullable(); // disponible tinyint(1) nullable default 0 (false)
            $table->string('image', 255)->nullable();     // image varchar(255) nullable
            $table->timestamps();                          // created_at & updated_at
        });
    }

    public function down()
    {
        Schema::dropIfExists('voitures');
    }
}
