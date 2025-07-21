<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

class PaiementController extends Controller
{
    public function store(Request $request)
    {
        // Validation simple
        $validator = Validator::make($request->all(), [
            'user_id' => 'required|integer',
            'voiture_id' => 'required|integer',
            'montant' => 'required|numeric|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'errors' => $validator->errors()
            ], 422);
        }

        // Insérer le paiement dans la base
        $paiementId = DB::table('paiements')->insertGetId([
            'user_id' => $request->user_id,
            'voiture_id' => $request->voiture_id,
            'montant' => $request->montant,
            'created_at' => now(),
        ]);

        return response()->json([
            'message' => 'Paiement créé avec succès',
            'paiement_id' => $paiementId,
        ], 201);
    }
}

