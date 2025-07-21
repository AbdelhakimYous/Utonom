<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Throwable;

class CreerUtilisateur extends Controller
{
    function createUser(Request $request)
    {
        try {
            $request->validate([
                'nom' => 'required|string|max:255',
                'prenom' => 'required|string|max:255',
                'email' => 'required|email|unique:utilisateur,email',
                'motdepasse' => 'required|string|min:8',
                'nomUtilisateur' => 'required|string|max:255',
                'age' => 'required|integer|min:0',
            ]);

            DB::table('utilisateur')->insert([
                'nom' => $request->input('nom'),
                'prenom' => $request->input('prenom'),
                'email' => $request->input('email'),
                'motdepasse' => bcrypt($request->input('motdepasse')),
                'nomUtilisateur' => $request->input('nomUtilisateur'),
                'age' => $request->input('age'),
                'role' => 'client'
            ]);

            return response()->json(['message' => 'Utilisateur enregistré avec succès'], 201);

        } 
        catch(Throwable $e)
        {
            Log::error('Erreur lors de la création de l\'utilisateur: ' . $e->getMessage());
            return response()->json(['error' => 'Erreur lors de la création de l\'utilisateur'], 500);
        }
    }



}