<?php

namespace App\Http\Controllers;

use Http;
use Illuminate\Http\Request;
use App\Models\Baliza;

class MapController extends Controller
{
    public function index(){
        return view("tiempo");
    }

    public function obtenerDatos()
    {
        $balizas = Baliza::all();
        return response()->json($balizas);
    }
}


