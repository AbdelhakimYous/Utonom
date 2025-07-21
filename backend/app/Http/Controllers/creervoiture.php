<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Throwable;

class CreerVoitureController extends Controller
{
    public function createVoiture(Request $request)
    {
        try {
            $request->validate([
                'modele' => 'required|string|max:100',
                'marque' => 'required|string|max:100',
                'immatriculation' => 'required|string|max:50|unique:voitures,immatriculation',
                'latitude' => 'required|numeric',
                'longitude' => 'required|numeric',
                'disponible' => 'sometimes|boolean',
                'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048'
            ]);

            $imagePath = null;

            if ($request->hasFile('image')) {
                $imagePath = $request->file('image')->store('voitures', 'public');
            }

            DB::table('voitures')->insert([
                'modele' => $request->input('modele'),
                'marque' => $request->input('marque'),
                'immatriculation' => $request->input('immatriculation'),
                'latitude' => $request->input('latitude'),
                'longitude' => $request->input('longitude'),
                'disponible' => $request->input('disponible', false),
                'image' => $imagePath,
            ]);

            $id = DB::getPdo()->lastInsertId();

            return response()->json([
                'message' => 'Voiture ajoutée avec succès',
                'id' => $id,
                'image_url' => $imagePath ? asset('storage/' . $imagePath) : null
            ], 201);

        } catch (Throwable $e) {
            Log::error('Erreur lors de l\'ajout de la voiture : ' . $e->getMessage());
            return response()->json(['error' => 'Erreur lors de l\'ajout de la voiture'], 500);
        }
    }
}
