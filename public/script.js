const socket = io()
const msgForm = document.getElementById('send-form')
const msgInput = document.getElementById('msg-input')
const msgCont = document.getElementById('msg-container')
const roomCont = document.getElementById('room-container')

if (msgForm != null) {
    let autor = prompt('Twoja nazwa')
    while (autor === '' || autor === null)
        autor = prompt('Twoja nazwa')
    appendMsg("Dołączyłeś do czatu.")
    socket.emit('join-msg', roomName, autor)


    msgForm.addEventListener('submit', e => {
        e.preventDefault()
        if (msgInput.value !== '') {
            const msg = msgInput.value
            socket.emit('send-chat-msg', roomName, msg)
            msgInput.value = ''
            const you = true
            appendMsg(msg, autor, you)
            msgCont.scrollTop = msgCont.scrollHeight;
        }
    })
} else {
    socket.on('room-created', room => {
        const roomBox = document.createElement('div')
        roomBox.setAttribute("class", "room-box")
        const roomElem = document.createElement('div')
        roomElem.innerText = "Pokój: " + room
        const roomLink = document.createElement('a')
        roomLink.href = `/${room}`
        roomLink.innerText = 'Dołącz'
        roomBox.appendChild(roomElem)
        roomBox.appendChild(roomLink)
        roomCont.appendChild(roomBox)
    })
}

socket.on('chat-msg', data => {
    appendMsg(data.msg, data.autor)
    msgCont.scrollTop = msgCont.scrollHeight;
})

socket.on('send-join-msg', data => {
    appendMsg(data + " dołączył/a do czatu.")
    msgCont.scrollTop = msgCont.scrollHeight;
})

socket.on('send-out-msg', autor => {
    appendMsg(autor + " opuścił/a czat.")
    msgCont.scrollTop = msgCont.scrollHeight;
});

function appendMsg(msg, autor, you) {
    const newMsg = document.createElement('div')
    msg = urlify(msg)
    newMsg.setAttribute("class", "msg")
    newMsg.innerHTML = "<p class='broadcast'>" + msg + "</p>"
    if (autor !== undefined)
        newMsg.innerHTML = "<p class='autor'>" + autor + "</p><p class='tresc'>" + msg
    if (you)
        newMsg.innerHTML = "<p class='autor you'>" + autor + "<span style='color:white'> (Ty)</span></p><p class='tresc'>" + msg
    msgCont.appendChild(newMsg)
    you = false
}

function checkImg(text) {
    return /\.(gif|jpe?g|tiff|png|webp|bmp)/i.test(text);
}

function urlify(text) {
    let urlRegex = /(https?:\/\/[^\s]+)/gi;
    return text.replace(urlRegex, function(url) {
        if (checkImg(url))
            return (
                '<a target="_blank" class="wraptext" href="' + url + '">' + url + '</a><img src="' + url + '"><span class="wraptext">'
            );

        return '<a target="_blank" class="wraptext" href="' + url + '">' + url + '</a><span class="wraptext">';
    })
}