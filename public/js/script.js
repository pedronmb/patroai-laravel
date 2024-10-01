let chats = []; // Para almacenar los chats anteriores
let currentChat = []; // Chat actual
let isNewChat = true; // Verifica si es un nuevo chat
let idOn = 0;
let userOn = '';
let flagToReloadListChat = true; //flag para recargar la lista de chats de la barra lateral


document.getElementById('sendButton').addEventListener('click', function() {
    sendMessage();
});

document.getElementById('userInput').addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        sendMessage();
    }
});

document.getElementById('newChatButton').addEventListener('click', function() {
    startNewChat();
});
//funcion para limpiar la lista de chats del sidebar
async function clearChatList() {
    const chatList = document.getElementById('chatList');
    while (chatList.firstChild) {
        chatList.removeChild(chatList.firstChild); // Elimina cada hijo del ul
    }
}

// Función para cargar chats desde la base de datos
async function loadChatsFromDatabase() {
    //let user = 'cali';
   

    /*const chatsFromDB = [
        { id: 1, messages: [{ sender: 'user', message: 'Hola' }, { sender: 'bot', message: 'Hola, ¿cómo estás?' }] },
        { id: 2, messages: [{ sender: 'user', message: '¿Qué tal el clima?' }, { sender: 'bot', message: 'Hace sol hoy.' }] }
    ];*/
    user = userOn;
    chats = await listOfChatBD(user); // Guardar los chats en la lista local
    
    //chats = chatsFromDB;
    console.log(chats);
    chats.sort((a, b) => b.id - a.id);
    chats.forEach(chat => addChatToList(chat));
}

// Función para agregar un chat a la lista de chats anteriores
function addChatToList(chat) {
    const chatList = document.getElementById('chatList');

  // Crear el elemento <li>
  const chatItem = document.createElement('li');
  chatItem.textContent = `Chat #${chat.id}`;

  // Crear el botón de eliminar
  const deleteButton = document.createElement('span');
  deleteButton.innerHTML = '<svg id="Layer_1" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke-width="1.5" width="24" height="24" color="#c30000"><defs><style>.cls-6374f8d9b67f094e4896c66b-1{fill:none;stroke:currentColor;stroke-miterlimit:10;}</style></defs><path class="cls-6374f8d9b67f094e4896c66b-1" d="M16.88,22.5H7.12a1.9,1.9,0,0,1-1.9-1.8L4.36,5.32H19.64L18.78,20.7A1.9,1.9,0,0,1,16.88,22.5Z"></path><line class="cls-6374f8d9b67f094e4896c66b-1" x1="2.45" y1="5.32" x2="21.55" y2="5.32"></line><path class="cls-6374f8d9b67f094e4896c66b-1" d="M10.09,1.5h3.82a1.91,1.91,0,0,1,1.91,1.91V5.32a0,0,0,0,1,0,0H8.18a0,0,0,0,1,0,0V3.41A1.91,1.91,0,0,1,10.09,1.5Z"></path><line class="cls-6374f8d9b67f094e4896c66b-1" x1="12" y1="8.18" x2="12" y2="19.64"></line><line class="cls-6374f8d9b67f094e4896c66b-1" x1="15.82" y1="8.18" x2="15.82" y2="19.64"></line><line class="cls-6374f8d9b67f094e4896c66b-1" x1="8.18" y1="8.18" x2="8.18" y2="19.64"></line></svg>'; // Puedes usar un ícono de FontAwesome o emoji
  deleteButton.style.marginLeft = '10px'; // Espaciado entre el texto y el botón
  
  // Añadir evento click al <li> para abrir el chat
  chatItem.addEventListener('click', function() {
    idOn = chat.id;
    console.log(idOn);
    loadChat(chat);
    flagToReloadListChat = false;
    isNewChat = false;
  });

  // Añadir evento click al botón para eliminar el chat
  deleteButton.addEventListener('click', function(event) {
    event.stopPropagation(); // Evita que el clic en el botón también abra el chat
    const confirmacion = confirm('¿Estás seguro de que deseas eliminar este chat?');
    if (confirmacion) {
        // Si el usuario confirma, eliminar el chat
        deleteChat(chat.id); // Llama a la función que elimina el chat
      } else {
        // Si el usuario cancela, no se hace nada
        console.log('Eliminación cancelada');
      }
    //console.error('presionaste eliminar');
  });

  // Añadir el botón de eliminar al <li>
  chatItem.appendChild(deleteButton);

  // Añadir el <li> a la lista de chats
  chatList.appendChild(chatItem);
}

async function listOfChatBD(user) {
    
    let chatsFromDB = [];
    
    // Simulación de una carga desde la BD (puedes sustituirlo por una llamada a tu backend)
    await fetch('http://patrocloai.zapto.org:34933/api/messageslist?user='+user)
            .then(response => {
                // Verifica si la respuesta es exitosa
                if (!response.ok) {
                throw new Error('Error en la solicitud: ' + response.statusText);
                }
                // Convertir la respuesta a JSON
                return response.json();
            })
            .then(data => {
                // Aquí accedes al JSON de la respuesta
                //console.log('Datos recibidos:', data);
                
                // Asegúrate de que data es un array
                if (Array.isArray(data)) {
                    data.forEach(item => {
                    //console.log('ID:', item.id);
                    //console.log('Message:', item.message);

                    chatsFromDB.push({ id: item.id , messages: JSON.parse(item.message) });

                    });
                } else {
                    console.log('La respuesta no es un array.');
                }
            })
            .catch(error => {
                // Manejo de errores
                console.error('Hubo un problema con la solicitud:', error);
            });

    /*const chatsFromDB = [
        { id: 1, messages: [{ sender: 'user', message: 'Hola' }, { sender: 'bot', message: 'Hola, ¿cómo estás?' }] },
        { id: 2, messages: [{ sender: 'user', message: '¿Qué tal el clima?' }, { sender: 'bot', message: 'Hace sol hoy.' }] }
    ];*/
    return chatsFromDB;
}


// Función para cargar un chat anterior en el chatbox
function loadChat(chat) {
    currentChat = chat.messages; // Cargar los mensajes del chat actual
    const chatbox = document.getElementById('chatbox');
    chatbox.innerHTML = ''; // Limpiar el chat actual
    chat.messages.forEach(message => {
        appendMessage(message.sender, message.message);
    });
    isNewChat = false; // No es un nuevo chat
}

// Iniciar un nuevo chat vacío
function startNewChat() {
    idOn = 0;
    currentChat = []; // Vaciar el chat actual
    document.getElementById('chatbox').innerHTML = ''; // Limpiar la pantalla de mensajes
    isNewChat = true; // Marca como un nuevo chat
    flagToReloadListChat = true;
}

// Función para enviar mensajes
function sendMessage() {
    const userInput = document.getElementById('userInput');
    const message = userInput.value.trim();
    const loadingImage = document.getElementById('loading');
    loadingImage.style.display = 'block';
    // Obtener el estado del checkbox
    const checkbox = document.getElementById('enable_selection');
    const checkboxValue = checkbox.checked;
    let radioValue;
    let checkInt = 0;
    console.log("Checkbox habilitado:", checkboxValue);
    console.log("idOnAntesLlamado:", idOn);
    console.log("flagToReloadListChat:", flagToReloadListChat);
    console.log("isNewChat:", isNewChat);

    // Obtener el valor del radio button seleccionado
    const selectedRadio = document.querySelector('input[name="selected_file"]:checked');
    if (selectedRadio) {
        radioValue = selectedRadio.value;
        console.log("Radio button seleccionado:", radioValue);
    } else {
        console.log("No hay radio button seleccionado");
        radioValue = 0;
    }
    if (checkboxValue){
        checkInt = 1;
    }else{
        checkInt = 0;
    }

    if (message !== '') {
        // Agregar el mensaje del usuario al chat actual
        appendMessage('user', message);
        currentChat.push({ sender: 'user', message: message });

        // Si es un nuevo chat, agregarlo a la lista y guardarlo en la BD
        if (isNewChat && currentChat.length === 1) {
            const newChatId = chats.length + 1;
            const newChat = { id: newChatId, messages: [...currentChat] };
            chats.push(newChat); // Agregarlo localmente
            //addChatToList(newChat); // Agregarlo a la lista de la interfaz
            saveChatToDatabase(newChat); // Guardarlo en la base de datos
            isNewChat = false; // Ya no es un nuevo chat
        }
        
        
        fetch('http://patrocloai.zapto.org:34933/api/messages?prompt='+encodeURIComponent(message)+'&id='+idOn+'&user='+userOn+'&checkvalue='+checkInt+'&radiovalue='+radioValue)
            .then(response => {

                
                // Verifica si la respuesta es exitosa
                if (!response.ok) {
                throw new Error('Error en la solicitud: ' + response.statusText);
                }
                // Convertir la respuesta a JSON
                return response.json();
            })
            .then(data => {
                // Aquí accedes al JSON de la respuesta
                console.log('Datos recibidos:', data);
                appendMessage('bot', data.response);
                
                // Ejemplo de acceso a propiedades específicas del JSON
                //console.log('Propiedad clave1:', data.clave1);
                //console.log('Propiedad clave2:', data.clave2);
                loadingImage.style.display = 'none';
                idOn = data.id;
                console.log("idOnDespuesLlamado:", idOn);
                //recarga la lista de chats si es un chat nuevo
                if (flagToReloadListChat){
                    clearChatList();
                    loadChatsFromDatabase();
                    flagToReloadListChat = false;
                }
            })
            .catch(error => {
                // Manejo de errores
                console.error('Hubo un problema con la solicitud:', error);
                loadingImage.style.display = 'none';
            });

        // Limpiar el campo de entrada
        
        userInput.value = '';
        
    }
}

// Función para agregar mensajes al chatbox
function appendMessage(sender, message) {
    const chatbox = document.getElementById('chatbox');
    const messageElement = document.createElement('div');
    messageElement.classList.add('message', sender);

    let converter = new showdown.Converter();
    let markdownText = message;

    let htmlOutput = converter.makeHtml(markdownText);

    messageElement.innerHTML = htmlOutput;

    //messageElement.textContent = htmlOutput;
    chatbox.appendChild(messageElement);

    // Desplazar hacia abajo
    chatbox.scrollTop = chatbox.scrollHeight;
}

// Función para guardar el chat en la base de datos
function saveChatToDatabase(chat) {
    // Aquí puedes hacer una llamada a tu backend para guardar el chat en la base de datos
    console.log("Guardando chat en la base de datos...", chat);
}

// Cargar los chats anteriores cuando se carga la página
window.onload = function() {
    userOn = document.getElementById('usuario').innerText;
    loadChatsFromDatabase();
    hideAlert();
};

function toggleRadioButtons(checkbox) {
    const radioButtons = document.querySelectorAll('input[type="radio"][name="selected_file"]');
    radioButtons.forEach(radio => {
        radio.disabled = !checkbox.checked;
    });
}

//funcion para eliminar chats
async function deleteChat(id) {
    
    try {
        const response = await fetch(`http://patrocloai.zapto.org:34933/api/messages/${id}`, {
          method: 'DELETE'// Especifica el método DELETE
          
        });
    
        // Verifica si la solicitud fue exitosa
        if (!response.ok) {
          throw new Error(`Error al eliminar el recurso: ${response.statusText}`);
        }
    
        // Si todo va bien, puedes procesar la respuesta
        const data = await response.json();
        console.log('Recurso eliminado con éxito:', data);
        clearChatList();
        loadChatsFromDatabase();
        startNewChat();
        
      } catch (error) {
        console.error('Error en la solicitud DELETE:', error);
      }
      
}

// Mostrar el alert cuando ocurra un error
function showAlert() {
    const alertBox = document.getElementById('alertBox');
    alertBox.classList.remove('d-none');
}

// Ocultar el alert manualmente o después de corregir el error
function hideAlert() {
    const alertBox = document.getElementById('alertBox');
    alertBox.classList.add('d-none');
}