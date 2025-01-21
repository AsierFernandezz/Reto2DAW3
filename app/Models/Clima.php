<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Clima extends Model
{
    use HasFactory;
    protected $fillable = [
        'baliza_id',
        'temperatura',
        'presion_atmosferica',
        'precipitaciones',
        'humedad',
        'viento',
        'tiempo',
        'fecha'
    ];

    public function baliza()
    {
        return $this->belongsTo(Baliza::class);
    }
}
