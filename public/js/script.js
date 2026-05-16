let chats = [];
let currentChat = [];
let isNewChat = true;
let idOn = 0;
let userOn = '';
let flagToReloadListChat = true;
let pendingDeleteChatId = null;

const markdownConverter = new showdown.Converter();

document.getElementById('sendButton').addEventListener('click', function () {
    sendMessage();
});

const userInputEl = document.getElementById('userInput');
userInputEl.addEventListener('keydown', function (event) {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        sendMessage();
    }
});

userInputEl.addEventListener('input', function () {
    autoResizeTextarea(userInputEl);
});

document.getElementById('newChatButton').addEventListener('click', function () {
    startNewChat();
});

const deleteChatModalEl = document.getElementById('deleteChatModal');
const confirmDeleteChatBtn = document.getElementById('confirmDeleteChatBtn');
if (confirmDeleteChatBtn && deleteChatModalEl) {
    confirmDeleteChatBtn.addEventListener('click', async function () {
        if (pendingDeleteChatId == null) {
            return;
        }
        const id = pendingDeleteChatId;
        pendingDeleteChatId = null;
        const modal = bootstrap.Modal.getInstance(deleteChatModalEl);
        if (modal) {
            modal.hide();
        }
        await deleteChatById(id);
    });
    deleteChatModalEl.addEventListener('hidden.bs.modal', function () {
        pendingDeleteChatId = null;
    });
}

async function clearChatList() {
    const chatList = document.getElementById('chatList');
    while (chatList.firstChild) {
        chatList.removeChild(chatList.firstChild);
    }
}

function autoResizeTextarea(el) {
    if (!el) {
        return;
    }
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 160) + 'px';
}

function syncEmptyState() {
    const chatbox = document.getElementById('chatbox');
    const empty = document.getElementById('chatEmptyState');
    if (!empty || !chatbox) {
        return;
    }
    const has = chatbox.querySelectorAll('.message').length > 0;
    empty.classList.toggle('is-hidden', has);
    empty.setAttribute('aria-hidden', has ? 'true' : 'false');
}

function updateChatHeader() {
    const title = document.getElementById('chatHeaderTitle');
    const sub = document.getElementById('chatHeaderSubtitle');
    if (!title || !sub) {
        return;
    }
    if (idOn && idOn > 0) {
        title.textContent = `Chat #${idOn}`;
        sub.textContent = 'Conversación guardada';
    } else {
        title.textContent = 'Nueva conversación';
        sub.textContent = 'Escribe un mensaje para comenzar';
    }
}

function setActiveChatListItem(chatId) {
    document.querySelectorAll('.chat-list-item').forEach((li) => {
        const id = Number(li.dataset.chatId);
        const match = chatId != null && Number(chatId) === id;
        li.classList.toggle('chat-list-item--active', match);
    });
}

function closeMobileSidebar() {
    const el = document.getElementById('chatSidebar');
    if (!el || typeof bootstrap === 'undefined') {
        return;
    }
    const inst = bootstrap.Offcanvas.getInstance(el);
    if (inst) {
        inst.hide();
    }
}

async function loadChatsFromDatabase() {
    chats = await listOfChatBD(userOn);
    console.log(chats);
    chats.sort((a, b) => b.id - a.id);
    chats.forEach((chat) => addChatToList(chat));
    setActiveChatListItem(idOn > 0 ? idOn : null);
    updateChatHeader();
}

function addChatToList(chat) {
    const chatList = document.getElementById('chatList');

    const chatItem = document.createElement('li');
    chatItem.className = 'chat-list-item';
    chatItem.dataset.chatId = String(chat.id);

    const title = document.createElement('span');
    title.className = 'chat-list-item-title';
    title.textContent = `Chat #${chat.id}`;

    const deleteButton = document.createElement('button');
    deleteButton.type = 'button';
    deleteButton.className = 'chat-list-item-delete';
    deleteButton.setAttribute('aria-label', 'Eliminar conversación');
    deleteButton.innerHTML =
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M16.88 22.5H7.12a1.9 1.9 0 01-1.9-1.8L4.36 5.32h15.28l-.86 15.38a1.9 1.9 0 01-1.9 1.8zM2.45 5.32h19.1M10.09 1.5h3.82a1.91 1.91 0 011.91 1.91V5.32H8.18V3.41A1.91 1.91 0 0110.09 1.5zM12 8.18V19.64M15.82 8.18V19.64M8.18 8.18V19.64"/></svg>';

    chatItem.addEventListener('click', function () {
        idOn = chat.id;
        console.log(idOn);
        loadChat(chat);
        flagToReloadListChat = false;
        isNewChat = false;
        setActiveChatListItem(chat.id);
        updateChatHeader();
        closeMobileSidebar();
    });

    deleteButton.addEventListener('click', function (event) {
        event.stopPropagation();
        pendingDeleteChatId = chat.id;
        const body = document.getElementById('deleteChatModalBody');
        if (body) {
            body.textContent = `¿Eliminar la conversación Chat #${chat.id}? Esta acción no se puede deshacer.`;
        }
        const modal = bootstrap.Modal.getOrCreateInstance(deleteChatModalEl);
        modal.show();
    });

    chatItem.appendChild(title);
    chatItem.appendChild(deleteButton);
    chatList.appendChild(chatItem);
}

async function listOfChatBD(user) {
    let chatsFromDB = [];

    await fetch('https://patroclo.myddns.me:34934/patroai/api/messageslist?user=' + user)
        .then((response) => {
            if (!response.ok) {
                throw new Error('Error en la solicitud: ' + response.statusText);
            }
            return response.json();
        })
        .then((data) => {
            if (Array.isArray(data)) {
                data.forEach((item) => {
                    chatsFromDB.push({ id: item.id, messages: JSON.parse(item.message) });
                });
            } else {
                console.log('La respuesta no es un array.');
            }
        })
        .catch((error) => {
            console.error('Hubo un problema con la solicitud:', error);
            showAlert(`Hubo un problema con la solicitud:${error}`);
        });

    return chatsFromDB;
}

function loadChat(chat) {
    currentChat = chat.messages;
    const chatbox = document.getElementById('chatbox');
    chatbox.innerHTML = '';
    chat.messages.forEach((message) => {
        appendMessage(message.sender, message.message);
    });
    isNewChat = false;
    syncEmptyState();
}

function startNewChat() {
    idOn = 0;
    currentChat = [];
    document.getElementById('chatbox').innerHTML = '';
    isNewChat = true;
    flagToReloadListChat = true;
    setActiveChatListItem(null);
    updateChatHeader();
    syncEmptyState();
}

function sendMessage() {
    const userInput = document.getElementById('userInput');
    const message = userInput.value.trim();
    const loadingImage = document.getElementById('loading');

    if (message === '') {
        loadingImage.style.display = 'none';
        return;
    }

    loadingImage.style.display = 'block';

    const checkbox = document.getElementById('enable_selection');
    const checkboxValue = checkbox.checked;
    let radioValue;
    let checkInt = 0;
    console.log('Checkbox habilitado:', checkboxValue);
    console.log('idOnAntesLlamado:', idOn);
    console.log('flagToReloadListChat:', flagToReloadListChat);
    console.log('isNewChat:', isNewChat);

    const selectedRadio = document.querySelector('input[name="selected_file"]:checked');
    if (selectedRadio) {
        radioValue = selectedRadio.value;
        console.log('Radio button seleccionado:', radioValue);
    } else {
        console.log('No hay radio button seleccionado');
        radioValue = 0;
    }
    if (checkboxValue) {
        checkInt = 1;
    } else {
        checkInt = 0;
    }

    const confTemperatureEl = document.getElementById('confTemperature');
    const confTemperatureVal = confTemperatureEl ? confTemperatureEl.value : '1';

    appendMessage('user', message);
    currentChat.push({ sender: 'user', message: message });

    if (isNewChat && currentChat.length === 1) {
        const newChatId = chats.length + 1;
        const newChat = { id: newChatId, messages: [...currentChat] };
        chats.push(newChat);
        saveChatToDatabase(newChat);
        isNewChat = false;
    }

    fetch(
        'https://patroclo.myddns.me:34934/patroai/api/messages?prompt=' +
            encodeURIComponent(message) +
            '&id=' +
            idOn +
            '&user=' +
            userOn +
            '&checkvalue=' +
            checkInt +
            '&radiovalue=' +
            radioValue +
            '&conftemperature=' +
            encodeURIComponent(confTemperatureVal)
    )
        .then((response) => {
            if (!response.ok) {
                throw new Error('Error en la solicitud: ' + response.statusText);
            }
            return response.json();
        })
        .then((data) => {
            console.log('Datos recibidos:', data);
            appendMessage('bot', data.response);
            loadingImage.style.display = 'none';
            idOn = data.id;
            console.log('idOnDespuesLlamado:', idOn);
            updateChatHeader();
            setActiveChatListItem(idOn > 0 ? idOn : null);
            if (flagToReloadListChat) {
                clearChatList();
                loadChatsFromDatabase();
                flagToReloadListChat = false;
            }
        })
        .catch((error) => {
            console.error('Hubo un problema con la solicitud:', error);
            showAlert(`Hubo un problema con la solicitud:${error}`);
            loadingImage.style.display = 'none';
        });

    userInput.value = '';
    autoResizeTextarea(userInput);
}

function appendMessage(sender, message) {
    const chatbox = document.getElementById('chatbox');
    const messageElement = document.createElement('div');
    messageElement.classList.add('message', sender);

    const htmlOutput = markdownConverter.makeHtml(message);
    messageElement.innerHTML = htmlOutput;

    chatbox.appendChild(messageElement);
    chatbox.scrollTop = chatbox.scrollHeight;
    syncEmptyState();
}

function saveChatToDatabase(chat) {
    console.log('Guardando chat en la base de datos...', chat);
}

window.onload = function () {
    userOn = document.getElementById('usuario').innerText;
    loadChatsFromDatabase();
    hideAlert();
    autoResizeTextarea(document.getElementById('userInput'));
    syncEmptyState();
};

function toggleRadioButtons(checkbox) {
    const radioButtons = document.querySelectorAll('input[type="radio"][name="selected_file"]');
    radioButtons.forEach((radio) => {
        radio.disabled = !checkbox.checked;
    });
}

async function deleteChatById(id) {
    try {
        const response = await fetch(`https://patroclo.myddns.me:34934/patroai/api/messages/${id}`, {
            method: 'DELETE',
        });

        if (!response.ok) {
            throw new Error(`Error al eliminar el recurso: ${response.statusText}`);
        }

        const data = await response.json();
        console.log('Recurso eliminado con éxito:', data);
        await clearChatList();
        startNewChat();
        await loadChatsFromDatabase();
    } catch (error) {
        console.error('Error en la solicitud DELETE:', error);
        showAlert(`Error en la solicitud DELETE:${error}`);
    }
}

function showAlert(message) {
    const alertBox = document.getElementById('alertBox');
    const alertMessage = document.getElementById('alertMessage');

    alertMessage.textContent = message;
    alertBox.classList.remove('d-none');
}

function hideAlert() {
    const alertBox = document.getElementById('alertBox');
    alertBox.classList.add('d-none');
}
