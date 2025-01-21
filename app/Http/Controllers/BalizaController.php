<?php

namespace App\Http\Controllers;

use Http;
use Illuminate\Http\Request;
use App\Models\Baliza;
use App\Models\Clima;

class BalizaController extends Controller
{
    public function index()
    {
        $climas = Baliza::all();
        return response()->json($climas);
    }

    public function show($id)
    {
        $clima = Baliza::find($id);
        if (!$clima) {
            return response()->json(['message' => 'Clima no encontrado'], 404);
        }
        return response()->json($clima);
    }

    public function store(Request $request)
    {
        $clima = Baliza::create($request->all());
        return response()->json($clima, 201);
    }

    public function update(Request $request, $id)
    {
        $clima = Baliza::find($id);
        if (!$clima) {
            return response()->json(['message' => 'Clima no encontrado'], 404);
        }
        $clima->update($request->all());
        return response()->json($clima);
    }

    public function destroy($id)
    {
        $clima = Baliza::find($id);
        if (!$clima) {
            return response()->json(['message' => 'Clima no encontrado'], 404);
        }
        $clima->delete();
        return response()->json(null, 204);
    }

}
