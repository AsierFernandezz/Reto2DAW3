<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Baliza extends Model
{
    use HasFactory;

    protected $table = 'baliza';
    protected $fillable = [
        'id', 'latitud', 'longitud','municipio'
    ];
}
