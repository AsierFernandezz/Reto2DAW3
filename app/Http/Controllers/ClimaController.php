<?php

namespace App\Http\Controllers;

use Http;
use Illuminate\Http\Request;
use App\Models\Baliza;
use App\Models\Clima;
use Illuminate\Support\Facades\DB;

class ClimaController extends Controller
{
    public function index()
    {
        $climas = Clima::all();
        return response()->json($climas);
    }

    public function show($id)
    {
        $clima = Clima::find($id);
        if (!$clima) {
            return response()->json(['message' => 'Clima no encontrado'], 404);
        }
        return response()->json($clima);
    }

    public function store(Request $request)
    {
        $clima = Clima::create($request->all());
        return response()->json($clima, 201);
    }

    public function update(Request $request, $id)
    {
        $clima = Clima::find($id);
        if (!$clima) {
            return response()->json(['message' => 'Clima no encontrado'], 404);
        }
        $clima->update($request->all());
        return response()->json($clima);
    }

    public function destroy($id)
    {
        $clima = Clima::find($id);
        if (!$clima) {
            return response()->json(['message' => 'Clima no encontrado'], 404);
        }
        $clima->delete();
        return response()->json(null, 204);
    }

    public function datosMunicipio($name){
        $baliza = Baliza::where('municipio', $name)->first();

        if (!$baliza) {
            return response()->json(['message' => 'Baliza no encontrada'], 404);
        }
        $datosClimas = Clima::where('baliza_id', $baliza->id)->orderBy('fecha', 'desc')->get();

        return response()->json($datosClimas);
    }

    public function ultimaMedicionPorBaliza()
    {
        $ultimasMediciones = Clima::select('climas.*')
            ->join(DB::raw('(
                SELECT baliza_id, MAX(fecha) as max_fecha
                FROM climas
                GROUP BY baliza_id
            ) as ultimas'), function($join) {
                $join->on('climas.baliza_id', '=', 'ultimas.baliza_id')
                    ->on('climas.fecha', '=', 'ultimas.max_fecha');
            })
            ->with('baliza')
            ->get();

        return response()->json($ultimasMediciones);
    }

}
