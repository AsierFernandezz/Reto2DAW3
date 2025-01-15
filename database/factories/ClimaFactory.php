<?php
// database/factories/ClimasFactory.php
namespace Database\Factories;

use App\Models\Clima;
use App\Models\Baliza;
use Illuminate\Database\Eloquent\Factories\Factory;

class ClimaFactory extends Factory
{
    protected $model = Clima::class;

    private $lastTemperature = null;
    private $lastWeather = null;
    private static $baseDate = null;

    public function definition(): array
    {
        // Si no hay fecha base, generar una aleatoria entre hace 6 meses y hoy
        if (self::$baseDate === null) {
            self::$baseDate = now()->subMonths(6)->addSeconds(rand(0, now()->diffInSeconds(now()->subMonths(6))));
        }

        // Obtener la baliza existente
        $baliza = Baliza::all()->random();

        // Si no hay temperatura previa, generar una base según la temporada
        if ($this->lastTemperature === null) {
            $month = self::$baseDate->month;
            // Temperaturas base según temporada
            if ($month >= 6 && $month <= 8) { // Verano
                $this->lastTemperature = $this->faker->randomFloat(2, 20, 30);
            } elseif ($month >= 12 || $month <= 2) { // Invierno
                $this->lastTemperature = $this->faker->randomFloat(2, 5, 15);
            } else { // Primavera u Otoño
                $this->lastTemperature = $this->faker->randomFloat(2, 10, 25);
            }
            $this->lastWeather = $this->faker->randomElement(['Soleado', 'Nublado', 'Lluvia', 'Parcialmente Nublado']);
        }

        // Variación suave de temperatura (-1 a +1 grado)
        $temperature = $this->lastTemperature + $this->faker->randomFloat(1, -1, 1);
        $this->lastTemperature = $temperature;

        // Coherencia en el tiempo meteorológico
        $weatherProbabilities = [
            'Soleado' => ['Soleado' => 0.7, 'Parcialmente Nublado' => 0.2, 'Nublado' => 0.1],
            'Parcialmente Nublado' => ['Soleado' => 0.3, 'Parcialmente Nublado' => 0.4, 'Nublado' => 0.3],
            'Nublado' => ['Parcialmente Nublado' => 0.3, 'Nublado' => 0.5, 'Lluvia' => 0.2],
            'Lluvia' => ['Lluvia' => 0.6, 'Nublado' => 0.3, 'Parcialmente Nublado' => 0.1]
        ];

        $weather = $this->getNextWeather($weatherProbabilities);
        $this->lastWeather = $weather;

        // Presión atmosférica basada en el tiempo
        $pressure = match($weather) {
            'Lluvia' => $this->faker->randomFloat(2, 950, 990),
            'Nublado' => $this->faker->randomFloat(2, 980, 1010),
            default => $this->faker->randomFloat(2, 1000, 1030)
        };

        // Precipitaciones basadas en el tiempo
        $precipitation = match($weather) {
            'Lluvia' => $this->faker->randomFloat(1, 5, 30),
            'Nublado' => $this->faker->randomFloat(1, 0, 5),
            default => 0
        };

        // Viento coherente con el tiempo
        $wind = match($weather) {
            'Lluvia' => $this->faker->randomFloat(1, 20, 80),
            'Nublado' => $this->faker->randomFloat(1, 10, 40),
            default => $this->faker->randomFloat(1, 0, 30)
        };

        return [
            'baliza_id' => $baliza->id,
            'temperatura' => $temperature,
            'presion_atmosferica' => $pressure,
            'precipitaciones' => $precipitation,
            'viento' => $wind,
            'tiempo' => $weather,
            'fecha' => self::$baseDate->format('Y-m-d H:i:s'),
            'created_at' => now(),
            'updated_at' => now(),
        ];
    }

    private function getNextWeather(array $probabilities): string
    {
        $random = $this->faker->randomFloat(2, 0, 1);
        $accumulated = 0;

        foreach ($probabilities[$this->lastWeather] as $weather => $probability) {
            $accumulated += $probability;
            if ($random <= $accumulated) {
                return $weather;
            }
        }

        return array_key_first($probabilities[$this->lastWeather]);
    }
}
