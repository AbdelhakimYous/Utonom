<?php

namespace App\Http\Controllers;

use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class ConnexionController extends Controller
{
    public function connexion(Request $request)
    {
        try {
            $req = $request->validate([
                'email' => 'required|email',
                'motdepasse' => 'required|string|min:8',
            ]);

            $email = $req['email'];
            $motdepasse = $req['motdepasse'];

            // Vérifier si email existe
            if (!$this->searchEmail($email)) {
                return response()->json(['error' => 'Email non trouvé'], 404);
            }

            // Vérifier mot de passe
            if (!$this->verifyPassword($email, $motdepasse)) {
                return response()->json(['error' => 'Mot de passe incorrect'], 401);
            }

            // Récupérer id et rôle
            $user = $this->getUserByEmail($email);
            if (!$user) {
                return response()->json(['error' => 'Utilisateur non trouvé'], 404);
            }

            return response()->json([
                'id' => $user->id,
                'roles' => $user->role,
                'email' => $email,
            ], 200);

        } catch (Exception $e) {
            return response()->json(['error' => 'Erreur de validation: ' . $e->getMessage()], 422);
        }
    }

    private function searchEmail($email)
    {
        return DB::table('utilisateur')->where('email', $email)->exists();
    }

    private function verifyPassword($email, $password)
    {
        $user = DB::table('utilisateur')->select('motdepasse')->where('email', $email)->first();
        return $user && Hash::check($password, $user->motdepasse);
    }

    private function getUserByEmail($email)
    {
        return DB::table('utilisateur')
            ->select('id', 'role')
            ->where('email', $email)
            ->first();
    }
}
