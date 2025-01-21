<?php
// database/seeders/ClimaSeeder.php
namespace Database\Seeders;

use App\Models\Clima;
use App\Models\Baliza;
use Illuminate\Database\Seeder;
use Carbon\Carbon;

class SeederClima extends Seeder{
    public function run(): void{
        // Obtener todas las balizas
        {
            $balizas = [
                ['id' => 1, 'latitud' => '43.2630', 'longitud' => '-2.9350', 'municipio' => 'Bilbao'],
                ['id' => 2, 'latitud' => '43.3224', 'longitud' => '-1.9846', 'municipio' => 'Donostia'],
                ['id' => 3, 'latitud' => '42.8467', 'longitud' => '-2.6716', 'municipio' => 'Vitoria-Gasteiz'],
                ['id' => 4, 'latitud' => '43.2847', 'longitud' => '-2.4671', 'municipio' => 'Eibar'],
                ['id' => 5, 'latitud' => '43.3349', 'longitud' => '-1.7897', 'municipio' => 'Irun']
            ];

        // Iterar sobre cada baliza
        foreach ($balizas as $baliza) {
            // Generar datos cada 2 horas durante los últimos 6 meses
            $startDate = Carbon::now()->subMonths(6); // Fecha de inicio para cada baliza
            for ($i = 0; $i < 2190; $i++) { // 180 intervalos de 2 horas en 6 meses
                $date = $startDate->copy()->addHours($i * 2); // Incrementar la fecha cada 2 horas
                Clima::factory()->create([
                    'baliza_id' => $baliza['id'], // Usar el ID de la baliza en lugar del id_aemet
                    'fecha' => $date, // Usar la fecha calculada
                ]);
            }
        }
    }
}
}
