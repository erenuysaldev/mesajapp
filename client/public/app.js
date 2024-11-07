const ws = new WebSocket('ws://localhost:3000');

ws.onopen = () => {
    const username = prompt('Kullanıcı adınızı girin:');
    ws.send(JSON.stringify({ type: 'newUser', username }));
};

ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.type === 'userList') {
        updateUsers(data.users);
    }
};

function updateUsers(users) {
    const userList = document.getElementById('userList');
    userList.innerHTML = '';
    users.forEach(user => {
        const userDiv = document.createElement('div');
        userDiv.className = 'user';
        userDiv.innerHTML = `
            <img src="default-avatar.png" alt="Avatar" width="30" height="30">
            <span>${user.username}</span>
            <span>${user.online ? '🟢' : '🔴'}</span>
        `;
        userList.appendChild(userDiv);
    });
}

function sendMessage() {
    const messageInput = document.getElementById('messageInput');
    const messages = document.getElementById('messages');
    const message = document.createElement('div');
    message.textContent = messageInput.value;
    messages.appendChild(message);
    messageInput.value = '';
}
