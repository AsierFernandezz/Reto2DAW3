<?php

namespace App\Http\Controllers;

use Http;
use Illuminate\Http\Request;
use App\Models\Baliza;

class MapController extends Controller
{
    public function index(){
        $id = request()->query('id', '20045');
        return view("tiempo", ['id' => $id]);
    }

    public function obtenerDatos()
    {
        $balizas = Baliza::all();
        return response()->json($balizas);
    }
}


