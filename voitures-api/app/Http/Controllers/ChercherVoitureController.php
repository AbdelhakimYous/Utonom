<?php

namespace App\Http\Controllers;

use Exception;
use Illuminate\Http\Request;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class ChercherVoitureController extends Controller
{
public function voitureLaPlusProche(Request $request)
{
    $request->validate([
        'latitude' => 'required|numeric',
        'longitude' => 'required|numeric',
    ]);
    
    $lat = $request->input('latitude');
    $lng = $request->input('longitude');

    // Formule Haversine pour calculer la distance
    $voiture = DB::table('voitures')
        ->select('*')
        ->selectRaw(
            '(6371 * acos(cos(radians(?)) * cos(radians(latitude)) * cos(radians(longitude) - radians(?)) + sin(radians(?)) * sin(radians(latitude)))) AS distance',
            [$lat, $lng, $lat]
        )
        ->orderBy('distance')
        ->first();

    if ($voiture) {
        return response()->json($voiture, 200);
    } else {
        return response()->json(['error' => 'Aucune voiture trouvée'], 404);
    }
}

    }
