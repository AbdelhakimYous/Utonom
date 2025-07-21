<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Dbtest;
use Illuminate\Support\Facades\App;
use App\Http\Controllers\CreerUtilisateur;
use App\Http\Controllers\ConnexionController;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::post('/nouveauutilisateur', [CreerUtilisateur::class, 'createUser']);

Route::post('/connexion', [ConnexionController::class, 'connexion']);


use Illuminate\Support\Facades\DB;

Route::get('/testDb', function () {
    try {
        $test = DB::select('SELECT * FROM utilisateurs LIMIT 1');
        return response()->json($test);
    } catch (\Throwable $e) {
        return response()->json(['error' => $e->getMessage()], 500);
    }
});
