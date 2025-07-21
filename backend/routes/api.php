<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Dbtest;
use Illuminate\Support\Facades\App;
use App\Http\Controllers\creerUtilisateur;
use App\Http\Controllers\ConnexionController;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::post('/nouveauutilisateur', [creerUtilisateur::class, 'createUser']);

Route::post('/connexion', [ConnexionController::class, 'connexion']);


Route::get('/testDb', [Dbtest::class, 'testDb'])->name('testDb');
