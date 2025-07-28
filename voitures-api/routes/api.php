<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\CreerVoitureController;

Route::post('/creervoiture', [CreerVoitureController::class, 'createVoiture']);
use App\Http\Controllers\ChercherVoitureController;

Route::post('/voiture-plus-proche', [ChercherVoitureController::class, 'voitureLaPlusProche']);

Route::get('/testDb', function () {
    try {
        DB::connection()->getPdo();
        return response()->json([
            'success' => true,
            'message' => 'Connexion à la base de données réussie 🚀'
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'message' => 'Échec de la connexion à la base de données ❌',
            'error' => $e->getMessage()
        ], 500);
    }
});


Route::get('/voitures-disponibles', [ChercherVoitureController::class, 'voituresDisponibles']);
Route::post('/accepter-voiture/{id}', [ChercherVoitureController::class, 'accepterVoiture']);
Route::get('/voitures-acceptees', [ChercherVoitureController::class, 'voituresAcceptees']);
Route::post('/accepter-voiture', [ChercherVoitureController::class, 'accepterVoiture']);

Route::get('/verifier-disponibilite/{id}', [ChercherVoitureController::class, 'verifierDisponibilite']);
