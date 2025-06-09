<?php

namespace App\Http\Controllers;

use Exception;
use Illuminate\Http\Request;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class connexion extends Controller
{
    public function connexion(Request $request)
    {

        try
        {

            $req = $request->validate([
                'email' => 'required|email',
                'motdepasse' => 'required|string|min:8',
            ]);

            $email = $req['email'];
            $motdepasse = $req['motdepasse'];
            $email = $this->searchEmail($email);

            if($email === true)
            {
                $password = $this->verifyPassword($req['email'], $req['motdepasse']);
                if($password === true)
                {
                    $roles = $this->verifyRole($req['email']);
return response()->json(["roles" => $roles->toArray()], 200);                }
                else
                {
                    return response()->json(['error' => 'false'], 401);
                }
            }
            else
            {
                return response()->json(['error' => 'Email non trouvé'], 404);
            }


        }
        catch (Exception $e)
        {
            return response()->json(['error' => 'Erreur de validation: ' . $e->getMessage()], 422);
        }
        
    }

    public function searchEmail($email)
    {
        $verify = DB::table("utilisateur")->select('email')->where('email', $email)->first();

        if($verify)
        {
            return true;
        }
        else
        {

            return response()->json(['error' => 'Email non trouvé'], 404);
        }
    }
    public function verifyPassword($email, $password)
    {
    $motdepasse = DB::table("utilisateur")->select('motdepasse')->where('email', $email)->first();
    if ($motdepasse && Hash::check($password, $motdepasse->motdepasse)) {
        return true;
    } else {
        return false;
    }
    }

    public function verifyRole($email)
    {
        return DB::table("utilisateur")
            ->join('roleutilisateur', 'utilisateur.id', '=', 'roleutilisateur.utiliId')
            ->join('role', 'roleutilisateur.roleId', '=', 'role.id')
            ->where('utilisateur.email', $email)
            ->select('role.role')
            ->get();
    }

}
