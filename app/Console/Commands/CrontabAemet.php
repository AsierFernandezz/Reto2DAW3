<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;
use App\Models\Baliza;
use App\Models\Clima;

class CrontabAemet extends Command
{
    // El nombre y la firma del comando
    protected $signature = 'fetch:clima';

    // Descripción del comando
    protected $description = 'Obtiene el clima de Irun desde OpenWeather y lo guarda en la base de datos';

    // Ejecutar el comando
    public function handle()
    {
        // Tu API Key de OpenWeather
        $apiKey = env('API_KEY');
        $balizas = Baliza::all();
        foreach ($balizas as $baliza) {
            $this->info("Obteniendo el clima para: {$baliza->municipio}");

        // Realiza la solicitud HTTP a la API de OpenWeather
        $response = Http::get("https://api.openweathermap.org/data/2.5/weather?q={$baliza->municipio}&appid={$apiKey}&units=metric&lang=es");

        // Si la respuesta es exitosa
        if ($response->successful()) {
            $data = $response->json();

            // Extraemos la información relevante del clima
            $tiempo = [
                'fecha' => now(), // Usamos la fecha y hora actuales
                'temperatura' => $data['main']['temp'],
                'humedad' => $data['main']['humidity'],
                'tiempo' => $data['weather'][0]['description'],
                'viento' => $data['wind']['speed'],
                'precipitaciones' => $data['rain']['1h'] ?? 0, // Lluvia en la última hora, si existe
                'presion_atmosferica' => $data['main']['pressure'] ?? 0, // Precipitación, si existe
                'baliza_id' => $baliza->id,
            ];

            // Insertar los datos en la base de datos (modelo Weather)
            Clima::create($tiempo);

            $this->info('Clima de '. $baliza->nombre.' insertado correctamente en la base de datos.');
        } else {
            $this->error('Error al obtener los datos del clima.');
        }
    }
    }
}
