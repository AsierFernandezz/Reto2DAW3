<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class SeederBaliza extends Seeder
{
    public function run()
    {
        $municipios = ['Irun', 'Donostia', 'Hondarribia', 'Errenteria', 'Pasaia'];

        $datos = [];
        foreach ($municipios as $municipio) {
            $datos[] = [
                'latitud' => mt_rand(4300000, 4330000), // Latitudes aproximadas de Gipuzkoa
                'longitud' => mt_rand(-200000, -180000), // Longitudes aproximadas de Gipuzkoa
                'municipio' => $municipio,
                'created_at' => now(),
                'updated_at' => now(),
            ];
        }

        DB::table('baliza')->insert($datos);
    }
}
