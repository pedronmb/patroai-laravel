# PatroAI (Laravel)

Aplicación web de chat con inteligencia artificial local. Tras registrarse o iniciar sesión, el usuario accede a un panel donde conversa con un modelo servido por **Ollama**, puede guardar y recuperar conversaciones en base de datos y, opcionalmente, adjuntar **contexto desde archivos** (por ejemplo esquemas o dumps) para orientar las respuestas como si fuera un asistente sobre datos.

## Requisitos

- PHP **8.1** o superior  
- [Composer](https://getcomposer.org/)  
- MySQL (u otro motor compatible con Laravel; el proyecto viene configurado para MySQL en `.env.example`)  
- [Ollama](https://ollama.com/) en ejecución en la misma máquina donde corre Laravel (por defecto el backend llama a `http://localhost:11434/api/generate`)  
- Modelo **llama3.1** disponible en Ollama (`ollama pull llama3.1`)

## Stack principal

- Laravel **10**  
- Autenticación por sesión (registro, login, logout)  
- API REST en `/api` para mensajes, listado y borrado de chats  
- Interfaz del chat: Blade, Bootstrap 5, Showdown (Markdown en las respuestas)

## Instalación

1. Clonar el repositorio e instalar dependencias PHP:

   ```bash
   composer install
   ```

2. Copiar entorno y generar clave:

   ```bash
   copy .env.example .env
   php artisan key:generate
   ```

3. Configurar en `.env` la conexión a la base de datos (`DB_*`) y `APP_URL` acorde a cómo sirvas la aplicación.

4. Ejecutar migraciones:

   ```bash
   php artisan migrate
   ```

5. Arrancar el servidor de desarrollo:

   ```bash
   php artisan serve
   ```

6. Asegúrate de que **Ollama** esté levantado y que el modelo `llama3.1` esté instalado.

## Rutas web relevantes

| Ruta | Descripción |
|------|-------------|
| `/` | Página de bienvenida por defecto de Laravel |
| `/login` | Inicio de sesión |
| `/registro` | Alta de usuario |
| `/privada` | Chat (requiere autenticación) |

Los formularios publican en `validar-registro`, `inicia-sesion`; la sesión se cierra con `logout` (nombres de ruta: `login`, `registro`, `privada`, etc., según `routes/web.php`).

## Modo “Base de datos” (contexto desde archivos)

En la zona privada puedes activar la opción de consultar sobre archivos colocados en:

`storage/app/db/`

El listado de esos archivos se muestra como opciones de radio en el panel. Si los activas, el contenido del archivo elegido se antepone al prompt con una instrucción para que el modelo responda en clave de **administrador de base de datos** usando esa información.

Crea la carpeta `db` dentro de `storage/app` si no existe y coloca ahí los archivos de texto que quieras usar como contexto.

## API (JSON)

Prefijo: `/api` (sin autenticación Sanctum en los endpoints actuales del chat; revisa seguridad si expones la app a Internet).

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/messages` | Envía `prompt`, `id`, `user`, `checkvalue`, `radiovalue`, `conftemperature` (query). Llama a Ollama y persiste/actualiza el hilo en `messages`. |
| GET | `/api/messageslist?user=...` | Lista conversaciones del usuario (id, nombre, mensajes). |
| DELETE | `/api/messages/{id}` | Elimina una conversación por id. |
| GET | `/api/status` | Comprobación simple de estado. |

La tabla `messages` guarda nombre, usuario, historial en JSON y el contexto de Ollama para continuar el hilo.

## Frontend y URL de la API

Las peticiones del chat se realizan desde `public/js/script.js`. En el repositorio pueden aparecer **URLs absolutas** apuntando a un despliegue concreto; para desarrollo local o otro dominio debes alinear esa base URL con tu `APP_URL` (por ejemplo rutas relativas como `/api/...` o la URL pública de tu instancia).

Tras cambiar el JavaScript, recarga forzada del navegador si hace falta para evitar caché.

## Personalización del modelo IA

En `app/Http/Controllers/ApiController.php` la llamada a Ollama usa el modelo `llama3.1` y `http://localhost:11434/api/generate`. Si usas otro modelo o Ollama en otro host/puerto, ajusta esos valores en el controlador.

## Licencia

El esqueleto del proyecto sigue la licencia **MIT** de Laravel. El contenido propio del proyecto puede tener la licencia que definas en tu organización.
