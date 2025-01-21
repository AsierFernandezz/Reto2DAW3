<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class SeederBaliza extends Seeder
{
    public function run()
    {
        $coordenadas = [
            'Bilbao' => ['43.2630', '-2.9350', '48020'],
            'Donostia' => ['43.3208', '-1.9844', '20069'],
            'Vitoria-Gasteiz' => ['42.8467', '-2.6716', '01059'],
            'Eibar' => ['43.1845', '-2.4717', '20030'],
            'Irun' => ['43.3390', '-1.7896', '20045']
        ];

        $datos = [];
        foreach ($coordenadas as $municipio => $coords) {
            $datos[] = [
                'latitud' => $coords[0],
                'longitud' => $coords[1],
                'municipio' => $municipio,
                'id_aemet' => $coords[2],
                'created_at' => now(),
                'updated_at' => now(),
            ];
        }

        DB::table('baliza')->insert($datos);
    }
}
