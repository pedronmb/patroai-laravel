<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Models\Message;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;

class Mensaje {
    public $sender;
    public $message;

    // Constructor para inicializar las propiedades
    public function __construct($sender, $message) {
        $this->sender = $sender;
        $this->message = $message;
    }
}

class ApiController extends Controller
{
    public function messages(Request $request){

        $error = ["error", 0];
        $allMessages = [];
        $fileName = '';
        $fileContent = '';
        $promptDB = '\n\nNecesito que contestes a mis consultas como un administrador de base de datos experto con la informacion de la base de datos que te estoy pasando.\n\n';

        if($request->has('prompt') && $request->has('id')){
            //obtengo las variables pasadas por la url
            $prompt = $request->query('prompt');
            $id = $request->query('id');
            $user = $request->query('user');
            $chekValue = $request->query('checkvalue');
            $radioValue = $request->query('radiovalue');
            //variables de configuracion del modelo
            $temperature = $request->query('conftemperature');
            //$temperature = 1;


            if ($chekValue == 1){
                // Obtener los archivos de la carpeta 'db' en storage
                $files = Storage::files('db');
                // Crear un array para enviar los nombres de los archivos al Blade
                $fileList = collect($files)->map(function ($file) {
                    return [
                        'name' => basename($file), // Nombre del archivo
                        'id' => md5($file) // Generar un ID único para cada archivo
                    ];
                });
                foreach ($fileList as $file) {
                    if ($file['id'] == $radioValue) {
                        
                        $fileName = $file['name'];
                    }
                }
                $filePath = 'db/' . $fileName;

                // Verificar si el archivo existe
                if (Storage::exists($filePath)) {
                    // Leer el contenido del archivo
                    $fileContent = Storage::get($filePath);
                } else {
                    // Si el archivo no existe, puedes manejar el error aquí
                    $fileContent = "El archivo no existe.";
                }
            }

            //consulto la BD para traer los mensajes anteriores si hubieran
            $messages = Message::where('id',$id)->first();

            //inicializo la llamada al modelo de IA
            $ch = curl_init();

            // Establecer la URL a la que se realizará la solicitud
            $url = "http://localhost:11434/api/generate"; // Reemplaza con la URL de tu servicio
            $data = "";
            if ($messages===null){
                $newPrompt = '';
                if ($chekValue==1){
                    $newPrompt = $fileContent.$promptDB.$prompt;
                }else{
                    $newPrompt = $prompt;
                }

                $data = json_encode([
                    "model" => "llama3.1",
                    "prompt" => $newPrompt,
                    "stream" => false,
                    "options" => [
                        "temperature" => (float)$temperature,
                        "num_ctx" => 4096
                    ]
                ]);
            }else{
                $data = json_encode([
                    "model" => "llama3.1",
                    "prompt" => $prompt,
                    "stream" => false,
                    "context" => json_decode($messages->context,true),
                    "options" => [
                        "temperature" => (float)$temperature,
                        "num_ctx" => 4096
                    ]
                ]);
            }
            // Configurar las opciones de cURL
            curl_setopt($ch, CURLOPT_URL, $url);          // Establecer la URL
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true); // Retornar el resultado como string
            curl_setopt($ch, CURLOPT_POST, true);                     // Método POST
            curl_setopt($ch, CURLOPT_POSTFIELDS, $data);              // Enviar los datos JSON en la solicitud
            curl_setopt($ch, CURLOPT_HTTPHEADER, array(               // Configurar el encabezado HTTP
                'Content-Type: application/json',                    // Indicar que se envían datos en formato JSON
                'Content-Length: ' . strlen($data)                   // Longitud del contenido
            ));

            // Ejecutar la solicitud y obtener la respuesta
            $response = curl_exec($ch);

            // Verificar si ocurrió un error
            if ($response === false) {
                $message =  curl_error($ch);
            } else {
                // Mostrar la respuesta
                $message =  json_decode($response, true);

                if ($messages===null){
                    //inicializar los mensajes en el array
                    $allMessages[] = new Mensaje("user", $prompt);
                    $allMessages[] = new Mensaje("bot", $message['response']);
                    //guardar los datos del modelo para la BD
                    $messages = new Message();
                    $messages->name = $prompt;
                    $messages->user = $user;
                    $messages->message = json_encode($allMessages);
                    $messages->context = json_encode($message['context']);

                    $messages->save();
                    $message['id'] = $messages->id;

                }else{

                    $oldMessages = json_decode($messages->message,true);
                    $oldMessages[] = new Mensaje("user", $prompt);
                    $oldMessages[] = new Mensaje("bot", $message['response']);

                    $messages->message = json_encode($oldMessages);
                    $messages->context = $message['context'];
                    $message['id'] = $messages->id;

                    $messages->save();
                }
            }

            // Cerrar la sesión cURL
            curl_close($ch);

        }
        else{
            $message = $error;
        }

        

        return response()->json($message);
    }


    public function messageslist(Request $request){

        $error = ["error", 0];
        if($request->has('user')){
            $user = $request->query('user');
            $messages = Message::select('id','name','message')->where('user',$user)->get();
            $message =  json_decode($messages, true);
        }
        else{
            $message = $error;
        }
        return response()->json($message);
    }

    public function destroy($id)
    {
        // Buscar el recurso por su ID
        $recurso = Message::find($id);

        // Si no se encuentra el recurso, devolver un error
        if (!$recurso) {
            return response()->json(['message' => 'Recurso no encontrado'], 404);
        }

        // Eliminar el recurso
        $recurso->delete();

        // Devolver una respuesta exitosa
        return response()->json(['message' => 'Recurso eliminado correctamente'], 200);
    }

    public function status(Request $request){

        $message = ["status", "ok"];
        return response()->json($message);
    }
}