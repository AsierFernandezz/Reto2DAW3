<?php

namespace App\Http\Controllers;

use Http;
use Illuminate\Http\Request;
use App\Models\Baliza;
use App\Models\Clima;

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

    public function datosMunicipio($name){
        $baliza = Baliza::where('municipio', $name)->first();

        if (!$baliza) {
            return response()->json(['message' => 'Baliza no encontrada'], 404);
        }
        $datosClimas = Clima::where('baliza_id', $baliza->id)->orderBy('fecha', 'desc')->get();

        return response()->json($datosClimas);
    }

}
