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
            ->where('disponible', false)
            ->orderBy('distance')
            ->first();

        if ($voiture) {
            // Mettre à jour la disponibilité à true
            DB::table('voitures')
                ->where('id', $voiture->id)
                ->update(['disponible' => true]);

            return response()->json($voiture, 200);
        } else {
            return response()->json(['error' => 'Aucune voiture trouvée'], 404);
        }
    }

    public function voituresDisponibles()
    {
        $voitures = DB::table('voitures')
            ->where('disponible', true)
            ->get();

        return response()->json($voitures, 200);
    }

    public function accepterVoiture(Request $request)
    {
        $request->validate([
            'id' => 'required|integer|exists:voitures,id'
        ]);

        DB::table('voitures')
            ->where('id', $request->input('id'))
            ->update(['disponible' => false]);

        return response()->json(['message' => 'Voiture acceptée avec succès.'], 200);
    }
public function refuserVoiture(Request $request)
{
    $request->validate([
        'id' => 'required|integer|exists:voitures,id'
    ]);

    DB::table('voitures')
        ->where('id', $request->input('id'))
        ->update(['disponible' => true]);

    return response()->json(['message' => 'Voiture refusée avec succès.'], 200);
}

    public function verifierDisponibilite($id)
{
    $voiture = DB::table('voitures')->where('id', $id)->first();

    if (!$voiture) {
        return response()->json(['error' => 'Voiture introuvable'], 404);
    }

    // On considère que "disponible = false" veut dire que la voiture est acceptée
    $estDisponible = ($voiture->disponible === false);

    return response()->json(['disponible' => $estDisponible], 200);
}

}


