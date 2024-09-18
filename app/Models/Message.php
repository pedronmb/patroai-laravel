<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Message extends Model
{
    use HasFactory;

    // Si el nombre de la tabla no sigue la convención pluralizada,
    // puedes especificarlo manualmente:
    // protected $table = 'nombre_tabla';

    // Definir los atributos que se pueden asignar masivamente (mass assignable)
    protected $fillable = ['name', 'user', 'message', 'context'];

    // Si no utilizas timestamps, deshabilítalos con:
    // public $timestamps = false;
}