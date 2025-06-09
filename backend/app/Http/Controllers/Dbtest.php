<?php

namespace App\Http\Controllers;
use Illuminate\Support\Facades\DB;


class Dbtest extends Controller
{
    public function testDb()
    {
        try {
            // Attempt to connect to the database
            DB::connection()->getPdo();
            return response()->json(['message' => 'Database connection successful'], 200);
        } catch (\Exception $e) {
            // Handle the error
            return response()->json(['error' => 'Database connection failed: ' . $e->getMessage()], 500);
        }
    }
    
}


