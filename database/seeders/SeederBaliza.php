<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class SeederBaliza extends Seeder
{
    public function run()
    {
        $coordenadas = [
            'Irun' => ['43.3390', '-1.7896'],
            'Donostia' => ['43.3208', '-1.9844'],
            'Hondarribia' => ['43.3622', '-1.7911'],
            'Errenteria' => ['43.3119', '-1.8985'],
            'Pasaia' => ['43.3237', '-1.9211'],
            'Madrid' => ['40.4168', '-3.7038'],
            'Barcelona' => ['41.3851', '2.1734']
        ];

        $datos = [];
        foreach ($coordenadas as $municipio => $coords) {
            $datos[] = [
                'latitud' => $coords[0],
                'longitud' => $coords[1],
                'municipio' => $municipio,
                'created_at' => now(),
                'updated_at' => now(),
            ];
        }

        DB::table('baliza')->insert($datos);
    }
}
