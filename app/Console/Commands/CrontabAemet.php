<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;
use App\Models\Clima;
use App\Models\Baliza;
use Carbon\Carbon;

class CrontabAemet extends Command
{
    protected $signature = 'aemet:fetch-data';
    protected $description = 'Fetch data from AEMET API and store in the Clima model';

    public function __construct()
    {
        parent::__construct();
    }

    public function handle()
    {
        $balizas = Baliza::all(); // Obtiene todas las balizas

        foreach ($balizas as $baliza) {
            $idAemet = $baliza->id;
            $apiKey = env('API_KEY'); // Reemplaza con tu API key

            $response = Http::get("https://opendata.aemet.es/opendata/api/prediccion/especifica/municipio/diaria/{$idAemet}", [
                'api_key' => $apiKey,
            ]);

            if ($response->successful()) {
                $data = $response->json();

                // Supongamos que la respuesta contiene los siguientes campos:
                $climaData = [
                    'baliza_id' => $baliza->id,
                    'temperatura' => $data['temperatura'],  // Ajusta según la estructura real de los datos
                    'presion_atmosferica' => $data['presion_atmosferica'],
                    'precipitaciones' => $data['precipitaciones'],
                    'viento' => $data['viento'],
                    'tiempo' => $data['tiempo'],
                    'fecha' => Carbon::now(),  // O ajusta según el dato de fecha recibido
                ];

                Clima::create($climaData);

                $this->info("Data for baliza ID {$baliza->id} stored successfully.");
            } else {
                $this->error("Failed to fetch data for baliza ID {$baliza->id} from AEMET API.");
            }
        }
    }
}

