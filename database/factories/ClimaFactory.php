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
        // Obtener un ID de Balizas existente
        $balizaId = Baliza::inRandomOrder()->first()->id; // Obtener un ID aleatorio de Balizas

        // Obtener una fecha aleatoria en los últimos 6 meses
        $date = Carbon::now()->subMonths(6)->addMinutes(rand(0, 180 * 24 * 60)); // 180 días en minutos

        // Redondear a intervalos de 2 horas
        $date->minute(0)->second(0);
        if ($date->hour % 2 !== 0) {
            $date->subHour();
        }

        // Determinar la estación del año basada en el mes
        $month = $date->month;
        $hour = $date->hour;

        // Ajustar rangos de temperatura según la estación
        if ($month >= 12 || $month <= 2) { // Invierno
            $minTemp = -5;
            $maxTemp = 15;
        } elseif ($month >= 3 && $month <= 5) { // Primavera
            $minTemp = 5;
            $maxTemp = 25;
        } elseif ($month >= 6 && $month <= 8) { // Verano
            $minTemp = 15;
            $maxTemp = 40;
        } else { // Otoño
            $minTemp = 5;
            $maxTemp = 20;
        }

        // Ajustar temperatura según la hora del día
        if ($hour >= 0 && $hour < 6) { // Madrugada
            $minTemp -= 3;
            $maxTemp -= 5;
        } elseif ($hour >= 6 && $hour < 12) { // Mañana
            $minTemp += 2;
            $maxTemp -= 2;
        } elseif ($hour >= 12 && $hour < 18) { // Tarde
            $minTemp += 5;
            $maxTemp += 2;
        } else { // Noche
            $minTemp -= 2;
            $maxTemp -= 3;
        }

        return [
            'temperatura' => $this->faker->randomFloat(1, $minTemp, $maxTemp),
            'presion_atmosferica' => $this->faker->randomFloat(1, 980, 1030), // Presión atmosférica típica en hPa
            'precipitaciones' => $this->faker->randomFloat(2, 0, 50), // Precipitaciones en mm
            'viento' => $this->faker->randomFloat(1, 0, 120), // Velocidad del viento en km/h
            'tiempo' => $this->faker->randomElement(['Soleado', 'Nublado', 'Lluvioso', 'Parcialmente nublado', 'Tormentoso']),
            'fecha' => $date->format('Y-m-d H:i:s'), // Asegurarse de que la fecha incluya la hora
            'baliza_id' => $balizaId, // Usar el ID de Balizas existente
            'created_at' => $date,
            'updated_at' => $date,
        ];
    }
}
