<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\Dbtest;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

Route::get('/verifColonnes', function () {
    $table = 'utilisateurs';
    $colonnesAttendu = [
        'id',
        'nom',
        'prenom',
        'email',
        'motdepasse',
        'nomUtilisateur',
        'age',
        'role'
    ];

    try {
        if (!Schema::hasTable($table)) {
            return response()->json(['error' => "La table `$table` n'existe pas."], 404);
        }

        $colonnesExistantes = Schema::getColumnListing($table);
        $manquantes = [];

        foreach ($colonnesAttendu as $colonne) {
            if (!in_array($colonne, $colonnesExistantes)) {
                $manquantes[] = $colonne;
            }
        }

        if (count($manquantes) > 0) {
            return response()->json([
                'message' => 'Colonnes manquantes détectées.',
                'colonnes_manquantes' => $manquantes,
                'colonnes_existantes' => $colonnesExistantes,
            ], 200);
        } else {
            return response()->json([
                'message' => 'Toutes les colonnes sont présentes dans la table.',
            ], 200);
        }
    } catch (\Throwable $e) {
        Log::error('Erreur dans /verifColonnes : ' . $e->getMessage());
        return response()->json(['error' => 'Erreur serveur'], 500);
    }
});



Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');
});


require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
