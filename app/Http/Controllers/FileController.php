<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class FileController extends Controller
{
    public function showFiles()
    {
        // Obtener los archivos de la carpeta 'db' en storage
        $files = Storage::files('db');

        // Crear un array para enviar los nombres de los archivos al Blade
        $fileList = collect($files)->map(function ($file) {
            return [
                'name' => basename($file), // Nombre del archivo
                'id' => md5($file) // Generar un ID único para cada archivo
            ];
        });

        // Pasar la lista de archivos a la vista
        return view('secret', ['files' => $fileList]);
    }
}
