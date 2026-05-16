<!DOCTYPE html>
<html lang="es" data-bs-theme="dark">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        <title>Chat</title>

        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400..700;1,9..40,400..700&display=swap" rel="stylesheet">
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH" crossorigin="anonymous">
        <link rel="stylesheet" href="{{ asset('css/styles.css') }}">
    </head>
    <body>
            <div class="main-container">
                <nav class="navbar app-top-nav">
                    <div class="nav-links">
                        <a href="#">Inicio</a>
                        <a data-bs-toggle="collapse" href="#collapseExample" role="button" aria-expanded="false" aria-controls="collapseExample">Base de Datos</a>
                        <a data-bs-toggle="collapse" href="#configuracion" role="button" aria-expanded="false" aria-controls="configuracion">Configuracion</a>
                    </div>
                    <div class="nav-user">
                        <div class="text-end nav-user-inner">
                            <span id="usuario">{{ Auth::user()->email }}</span>
                            <a href="{{route('logout')}}"><button type="button" class="btn btn-outline-primary btn-sm ms-2">Salir</button></a>
                        </div>
                    </div>
                </nav>
                <nav class="navbar app-sub-nav">
                    <div class="collapse w-100" id="collapseExample">
                        <label for="enable_selection" class="form-check-label">
                        <input type="checkbox" class="form-check-input" id="enable_selection" name="enable_selection" onchange="toggleRadioButtons(this)">
                        Realizar consultas sobre la Base de Datos:
                        </label>
                        <div id="file_list" class="mt-2">
                            @foreach($files as $file)
                                <div class="radio-option">
                                    <input type="radio" name="selected_file" value="{{ $file['id'] }}" disabled id="{{ $file['id'] }}">
                                    <label for="file_{{ $file['id'] }}">{{ $file['name'] }}</label>
                                </div>
                            @endforeach
                        </div>
                    </div>

                    <div class="collapse w-100" id="configuracion">
                        <label for="confTemperature" class="me-2">Temperature:</label>
                        <input type="number" id="confTemperature" name="confTemperature" min="0" max="2" step="0.01" value="1">
                    </div>
                </nav>
                <div id="alertBox" class="alert alert-danger alert-dismissible d-none mx-3 mt-2 mb-0" role="alert">
                    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Cerrar"></button>
                    <strong>Error.</strong> <span id="alertMessage">Message</span>
                </div>

                <div class="app-container">
                    <button type="button" class="btn btn-outline-secondary btn-sm sidebar-toggle d-lg-none" data-bs-toggle="offcanvas" data-bs-target="#chatSidebar" aria-controls="chatSidebar">
                        Chats
                    </button>

                    <div class="offcanvas-lg offcanvas-start sidebar-offcanvas" tabindex="-1" id="chatSidebar" aria-labelledby="chatSidebarLabel">
                        <div class="offcanvas-header d-lg-none border-bottom border-secondary border-opacity-25">
                            <h2 class="offcanvas-title h5 mb-0" id="chatSidebarLabel">Conversaciones</h2>
                            <button type="button" class="btn-close" data-bs-dismiss="offcanvas" aria-label="Cerrar"></button>
                        </div>
                        <div class="offcanvas-body sidebar d-flex flex-column">
                            <div class="sidebar-brand d-none d-lg-flex align-items-center gap-2 mb-3">
                                <span class="sidebar-brand-dot" aria-hidden="true"></span>
                                <h2 class="sidebar-title mb-0">Conversaciones</h2>
                            </div>
                            <ul id="chatList" class="chat-list flex-grow-1"></ul>
                            <button type="button" id="newChatButton" class="btn-new-chat">Nuevo chat</button>
                        </div>
                    </div>

                    <div class="chat-shell">
                        <header class="chat-header">
                            <div class="chat-header-text">
                                <h1 class="chat-header-title" id="chatHeaderTitle">Nueva conversación</h1>
                                <p class="chat-header-subtitle" id="chatHeaderSubtitle">Escribe un mensaje para comenzar</p>
                            </div>
                        </header>

                        <div class="chat-scroll-wrap">
                            <div id="chatEmptyState" class="chat-empty" aria-hidden="false">
                                <div class="chat-empty-icon" aria-hidden="true">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.25"><path stroke-linecap="round" stroke-linejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z"/></svg>
                                </div>
                                <p class="chat-empty-title">Sin mensajes aún</p>
                                <p class="chat-empty-desc">Escribe un mensaje para empezar o elige una conversación en la barra lateral.</p>
                            </div>
                            <div id="chatbox" class="chatbox"></div>
                        </div>

                        <div class="composer">
                            <div id="loading" class="loader" aria-hidden="true"></div>
                            <div class="composer-inner">
                                <label for="userInput" class="visually-hidden">Mensaje</label>
                                <textarea id="userInput" class="composer-input" rows="1" placeholder="Escribe tu mensaje… (Mayús+Intro para nueva línea)"></textarea>
                                <button type="button" id="sendButton" class="composer-send" title="Enviar" aria-label="Enviar">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        <div class="modal fade" id="deleteChatModal" tabindex="-1" aria-labelledby="deleteChatModalLabel" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content border-secondary">
                    <div class="modal-header border-secondary">
                        <h5 class="modal-title" id="deleteChatModalLabel">Eliminar conversación</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
                    </div>
                    <div class="modal-body">
                        <p class="mb-0" id="deleteChatModalBody">¿Eliminar esta conversación? Esta acción no se puede deshacer.</p>
                    </div>
                    <div class="modal-footer border-secondary">
                        <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Cancelar</button>
                        <button type="button" class="btn btn-danger" id="confirmDeleteChatBtn">Eliminar</button>
                    </div>
                </div>
            </div>
        </div>

        <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
        <script src="https://cdn.jsdelivr.net/npm/showdown@2/dist/showdown.min.js"></script>
        <script src="{{ asset('js/script.js') }}"></script>

    </body>
</html>
