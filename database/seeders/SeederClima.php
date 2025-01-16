<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Baliza;
use App\Models\Clima;
use Database\Factories\ClimaFactory;
use Carbon\Carbon;

class SeederClima extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Crear 10 balizas con datos de prueba de Euskal Herria
        $balizas = [
            ['latitud' => '43.2630', 'longitud' => '-2.9350', 'municipio' => 'Bilbao'],
            ['latitud' => '43.3224', 'longitud' => '-1.9846', 'municipio' => 'Donostia'],
            ['latitud' => '42.8467', 'longitud' => '-2.6716', 'municipio' => 'Vitoria-Gasteiz'],
            ['latitud' => '43.2847', 'longitud' => '-2.4671', 'municipio' => 'Eibar'],
            ['latitud' => '43.3349', 'longitud' => '-1.7897', 'municipio' => 'Irun'],
        ];
        Baliza::factory()->count(5)->create();
        foreach ($balizas as $baliza) {
            $baliza = Baliza::create($baliza);
            $date = Carbon::now()->subMonths(6);

            for ($i = 0; $i < 2184; $i++) {
                Clima::factory()->create([
                    'baliza_id' => $baliza->id,
                    'fecha' => $date->copy()->addHours($i * 2), // Incrementar la fecha cada 2 horas
                ]);
            }
        }
    }
}
