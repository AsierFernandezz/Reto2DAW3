<?php

namespace Database\Factories;

use App\Models\Baliza;
use App\Models\Clima;
use Illuminate\Database\Eloquent\Factories\Factory;
use Carbon\Carbon;

class ClimaFactory extends Factory
{
    protected $model = Clima::class;

    public function definition(): array
    {
        //obtiene un ID deb balizas
        $balizaId = Baliza::inRandomOrder()->first()->id;

        //obtiene una fecha aleatoria desde hace 6 meses hasta hoy
        $startDate = Carbon::now()->subMonths(6)->startOfDay();
        $endDate = Carbon::now()->endOfDay();
        $date = Carbon::createFromTimestamp(rand($startDate->timestamp, $endDate->timestamp));

        //redondea a intervalos de 2 horas
        $date->minute(0)->second(0);
        if ($date->hour % 2 !== 0) {
            $date->subHour();
        }

        //determina la estacion del año segun en el mes
        $month = $date->month;
        $hour = $date->hour;

        //ajusta rangos de temperatura segun la estacion
        if ($month == 12 || $month <= 2) { // Invierno
            $minTemp = 0;
            $maxTemp = 12;
        } elseif ($month >= 3 && $month <= 5) { // Primavera
            $minTemp = 8;
            $maxTemp = 20;
        } elseif ($month >= 6 && $month <= 8) { // Verano
            $minTemp = 18;
            $maxTemp = 35;
        } else { // Otoño
            $minTemp = 10;
            $maxTemp = 22;
        }

        //ajusta la temperatura segun la hora del dia
        if ($hour >= 0 && $hour < 6) { // Madrugada
            $minTemp -= 2;
            $maxTemp -= 3;
        } elseif ($hour >= 6 && $hour < 12) { // Mañana
            $minTemp += 1;
            $maxTemp -= 1;
        } elseif ($hour >= 12 && $hour < 18) { // Tarde
            $minTemp += 3;
            $maxTemp += 1;
        } else { // Noche
            $minTemp -= 1;
            $maxTemp -= 2;
        }

        // Generar datos meteorológicos más realistas
        $temperatura = $this->faker->randomFloat(1, $minTemp, $maxTemp);
        $presion = $this->faker->randomFloat(1, 1000, 1020); // Rango más realista
        $precipitaciones = $this->faker->randomFloat(1, 0, 25); // Menos precipitaciones extremas
        $viento = $this->faker->randomFloat(0, 0, 80); // Velocidad del viento más realista
        $humedad = $this->faker->numberBetween(30, 100); // Humedad entre 30% y 100%

        //determina el tiempo basado en las condiciones
        $tiempo = 'Soleado';
        if ($precipitaciones > 15) {
            $tiempo = 'Tormentoso';
        } elseif ($precipitaciones > 5) {
            $tiempo = 'Lluvioso';
        } elseif ($viento > 40) {
            $tiempo = 'Nublado';
        } elseif ($viento > 20) {
            $tiempo = 'Parcialmente nublado';
        }

        return [
            'temperatura' => $temperatura,
            'presion_atmosferica' => $presion,
            'precipitaciones' => $precipitaciones,
            'viento' => $viento,
            'humedad' => $humedad,
            'tiempo' => $tiempo,
            'fecha' => $date,
            'baliza_id' => $balizaId,
            'created_at' => $date,
            'updated_at' => $date,
        ];
    }
}
