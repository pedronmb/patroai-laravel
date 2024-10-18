<!DOCTYPE html>
<html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        <title>Chat</title>

        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.2.0-beta1/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-0evHe/X+R7YkIZDRvuzKMRqM+OrBnVFBL6DOitfPri4tjfHxaWutUpFmBp4vmVor" crossorigin="anonymus">
        <link rel="stylesheet" href="{{ asset('css/styles.css') }}">
    </head>
    <body>
            
            <div class="main-container">
                <nav class="navbar">
                    <div class="nav-links">
                        <a href="#">Inicio</a>
                        <a data-bs-toggle="collapse" href="#collapseExample" role="button" aria-expanded="false" aria-controls="collapseExample">Base de Datos</a>
                        <a data-bs-toggle="collapse" href="#configuracion" role="button" aria-expanded="false" aria-controls="configuracion">Configuracion</a>
                    </div>
                    <div class="nav-user">
                        <div class="col-md-3 text-end">
                            <span id="usuario">{{ Auth::user()->email }}</span>
                            <a href="{{route('logout')}}"><button type="button" class="btn btn-outline-primary me-2">Salir</button></a>
                        </div>
                    </div>
                </nav>
                <nav class="navbar">
                    <div class="collapse" id="collapseExample">
                        
                        <label for="enable_selection">
                        <input type="checkbox" id="enable_selection" name="enable_selection" onchange="toggleRadioButtons(this)">
                        Realizar consultas sobre la Base de Datos:
                        </label>
                        
                        <div id="file_list">
                            @foreach($files as $file)
                                <div class="radio-option">
                                    <input type="radio" name="selected_file" value="{{ $file['id'] }}" disabled id="{{ $file['id'] }}">
                                    <label for="file_{{ $file['id'] }}">{{ $file['name'] }}</label>
                                </div>
                            @endforeach
                        </div>
                    </div>

                    <div class="collapse" id="configuracion">
                        
                    <label for="confTemperature">Temperature:</label>
                    <input type="number" id="confTemperature" name="confTemperature" min="0" max="2" step="0.01" value="1">
                        
                        
                    </div>
                    
                </nav>
                <div id="alertBox" class="alert alert-danger alert-dismissible">
                    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
                    <strong>Danger!</strong> <span id="alertMessage">Message<span>
                </div>

                <div class="app-container">
                    <!-- Panel lateral para la lista de chats -->
                    <div class="sidebar">
                        <h2>Chats Anteriores</h2>
                        <ul id="chatList">
                            <!-- Chats anteriores se cargarán aquí desde la base de datos -->
                        </ul>
                        <button id="newChatButton">Nuevo Chat</button>
                    </div>

                    <!-- Área principal del chat -->
                    <div class="chat-container">
                        <div id="chatbox" class="chatbox">
                            <!-- Mensajes del chat se mostrarán aquí -->
                        </div>
                        <div class="input-area">
                            <div id="loading" class="loader"></div>
                            <input type="text" id="userInput" placeholder="Escribe tu mensaje...">
                            <button id="sendButton">Enviar</button>
                        </div>
                    </div>
                </div>
            </div>
        <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
        <script src="https://cdn.jsdelivr.net/npm/showdown@2/dist/showdown.min.js"></script>
        <script src="{{ asset('js/script.js') }}"></script>

    </body>
    
</html>
