<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\DB;
use App\Http\Controllers\ConnexionController;
use App\Http\Controllers\CreerUtilisateur;


Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::post('/nouveauutilisateur', [CreerUtilisateur::class, 'createUser']);

Route::post('/connexion', [ConnexionController::class, 'connexion']);


Route::get('/testDb', function () {
    try {
        DB::connection()->getPdo();
        return response()->json([
            'success' => true,
            'message' => 'Connexion à utilisateur 🚀'
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'message' => 'Échec de la connexion à la base de données ❌',
            'error' => $e->getMessage()
        ], 500);
    }
});