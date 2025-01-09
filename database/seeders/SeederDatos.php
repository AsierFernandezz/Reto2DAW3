<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class SeederDatos extends Seeder
{
    public function run()
    {
        $direccionesViento = ['N', 'S', 'E', 'O', 'NE', 'NO', 'SE', 'SO'];

        // Obtener todos los IDs de balizas
        $balizaIds = DB::table('baliza')->pluck('id')->toArray();

        $datos = [];
        foreach ($balizaIds as $balizaId) {
            $datos[] = [
                'baliza_id' => $balizaId,
                'precipitacion' => round(mt_rand(0, 2000) / 100, 2), // Valores entre 0 y 20 mm
                'humedad' => round(mt_rand(50, 100) / 1, 2),         // Valores entre 50% y 100%
                'velocidad_viento' => round(mt_rand(0, 1500) / 100, 2), // Valores entre 0 y 15 km/h
                'direccion_viento' => $direccionesViento[array_rand($direccionesViento)],
                'created_at' => now(),
                'updated_at' => now(),
            ];
        }

        DB::table('datos_meteorologicos')->insert($datos);
    }
}
