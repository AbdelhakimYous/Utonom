<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreatePaiementsTable extends Migration
{
    public function up()
    {
        Schema::create('paiements', function (Blueprint $table) {
            $table->increments('id');                 // id primaire auto-increment
            $table->unsignedInteger('user_id');      // user_id int(11) NOT NULL
            $table->unsignedInteger('voiture_id');   // voiture_id int(11) NOT NULL
            $table->decimal('montant', 10, 2);       // montant decimal(10,2) NOT NULL
            $table->timestamp('created_at')->useCurrent(); // created_at timestamp NOT NULL DEFAULT current_timestamp()

        });
    }

    public function down()
    {
        Schema::dropIfExists('paiements');
    }
}
