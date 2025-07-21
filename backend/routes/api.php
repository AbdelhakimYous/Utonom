<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Dbtest;
use Illuminate\Support\Facades\App;
use App\Http\Controllers\ConnexionController;
use App\Http\Controllers\CreerUtilisateur;


Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::post('/nouveauutilisateur', [CreerUtilisateur::class, 'createUser']);

Route::post('/connexion', [ConnexionController::class, 'connexion']);


Route::get('/testDb', [Dbtest::class, 'testDb'])->name('testDb');
