<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Baliza;
use App\Models\Clima;
use Database\Factories\ClimaFactory;

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
            ['latitud' => '43.0648', 'longitud' => '-2.4902', 'municipio' => 'Arrasate'],
            ['latitud' => '43.2847', 'longitud' => '-2.4671', 'municipio' => 'Eibar'],
            ['latitud' => '43.3349', 'longitud' => '-1.7897', 'municipio' => 'Irun'],
            ['latitud' => '43.2853', 'longitud' => '-2.1688', 'municipio' => 'Tolosa'],
            ['latitud' => '43.3397', 'longitud' => '-3.0367', 'municipio' => 'Portugalete'],
            ['latitud' => '43.1574', 'longitud' => '-2.0789', 'municipio' => 'Hernani'],
            ['latitud' => '43.2908', 'longitud' => '-2.8800', 'municipio' => 'Barakaldo']
        ];

        foreach ($balizas as $baliza) {
            $baliza = Baliza::create($baliza);

            // Para cada baliza, crear 5 registros de clima usando el factory
            for ($i = 0; $i < 12; $i++) {
                Clima::factory()->create([
                    'baliza_id' => $baliza->id,
                    'fecha' => now()->startOfDay()->addHours($i * 2) // Cada 2 horas
                ]);
            }
        }
    }
}
