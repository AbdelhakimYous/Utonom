<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\CreerVoitureController;

Route::post('/creervoiture', [CreerVoitureController::class, 'createVoiture']);
use App\Http\Controllers\ChercherVoitureController;

Route::post('/voiture-plus-proche', [ChercherVoitureController::class, 'voitureLaPlusProche']);