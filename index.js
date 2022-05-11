const getRandomInt = (max) => {
    return Math.floor(Math.random() * max);
}

const id = Math.random(1000000);
const url = `ws://localhost:5001/websockets?userId=${id}`;
const webSocket = new WebSocket("ws://localhost:5001/websockets");

const user = {};
const state = {
    nameEntered: false,
    messages: [],
    coordsHistory: []
}
const nameScreen = document.getElementById("nameScreen");
const appScreen = document.getElementById("appScreen");
const nameButton = document.getElementById("nameButton");
const sendButton = document.getElementById("sendButton");
const textField = document.getElementById("text");
const nameField = document.getElementById("name");
const messages = document.getElementById("messages")

const setName = () => {
    const nameEntered = nameField.value;
    if (nameEntered){
        user.name = nameField.value;
        state.nameEntered = true;
        nameScreen.setAttribute("class","hidden")
        appScreen.setAttribute("class","")
        renderMessages();
        drawHistory();
    }
}

const renderMessages = () => {
    while (messages.firstChild) {
        messages.removeChild(messages.lastChild);
    }

    state.messages.sort((a,b) => b.date - a.date).forEach(message => {
        const div = document.createElement("div");
        if (message.name === user.name) {
            div.setAttribute("class", "ownMessage")
        }
        const nameLabel = document.createElement("label");
        const textPara = document.createElement("p");
        const nameValue = document.createTextNode(message.name);
        const textValue  = document.createTextNode(message.text);
        nameLabel.appendChild(nameValue );
        textPara.appendChild(textValue );
        div.appendChild(nameLabel);
        div.appendChild(textPara);
        messages.appendChild(div);
    })
}

const submitMessage = () => {
    const text = textField.value;
    if (!text) return;

    const json = JSON.stringify({
        type: "message",
        message: {
            name: user.name,
            text,
            date: Date.now()
        }
    })

    webSocket.send(JSON.stringify(json))

    textField.value = "";
    textField.focus();
}

nameButton.addEventListener("mousedown", (e) => {
    setName();
})

nameField.addEventListener("keydown", (e) => {
    const char = e.key;
    if (char === "Enter"){
        setName();
        e.preventDefault();
        textField.focus();
    }
})

sendButton.addEventListener("mousedown", (e) => {
    submitMessage();
})

textField.addEventListener("keydown", (e) => {
    const char = e.key;
    if (char === "Enter" && !e.shiftKey){
        submitMessage();
        e.preventDefault();
        textField.focus();
    }
})

webSocket.onmessage = (event) => {
    const data = JSON.parse(event.data);
    switch (data.type) {
        case "messages":
            state.messages = data.messages;
            renderMessages();
            break;
        case "draw":
            if (state.nameEntered === true){
                newDraw(data.coords.start, data.coords.end);
            }
            state.coordsHistory.push(data.coords);
            break;
    }
}

window.onload = () => {
    window.addEventListener('resize', handleWindowResize);
    nameField.focus();
}

// console.log(json);

// webSocket.onopen = () => {
//     const json = JSON.stringify({
//         type: "connection",
//     })
//     webSocket.send(JSON.stringify(json))
// }

// CANVAS

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
let coord = { x: 0, y: 0 };

document.addEventListener('mousedown', start);
document.addEventListener('mouseup', stop);

const drawHistory = () => {
    state.coordsHistory.forEach(coords => newDraw(coords.start, coords.end))
}

const resize = () => {
    ctx.canvas.width = window.innerWidth - 336;
    ctx.canvas.height = window.innerHeight - 20;
}

const handleWindowResize = () => {
    resize();
    drawHistory();
}

resize();

const submitDraw = (startCoord, endCoord) => {
    const json = JSON.stringify({
        type: "draw",
        coords: {
            start: startCoord,
            end: endCoord,
        }
    })

    webSocket.send(JSON.stringify(json))
}

const getEndCoord = (event) => {
    return {
        x: (event.clientX - canvas.offsetLeft) - canvas.offsetWidth/2,
        y: (event.clientY - canvas.offsetTop) - canvas.offsetHeight/2
    }
}

function start(event) {
    document.addEventListener('mousemove', handleCanvasEvent);
    coord = getEndCoord(event);
}

function stop() {
    document.removeEventListener('mousemove', handleCanvasEvent);
}

const handleCanvasEvent = (event) => {
    const startCoord = coord;
    const endCoord = getEndCoord(event);
    submitDraw(startCoord, endCoord);
    // newDraw(startCoord, endCoord);
    coord = endCoord;
}

const newDraw = (startCoord, endCoord) => {
    const relativeStartCoord = {
        x: startCoord.x + canvas.offsetWidth / 2,
        y: startCoord.y + canvas.offsetHeight / 2,
    };
    const relativeEndCoord = {
        x: endCoord.x + canvas.offsetWidth / 2,
        y: endCoord.y + canvas.offsetHeight / 2,
    };
    ctx.beginPath();
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#222222';
    ctx.moveTo(relativeStartCoord.x, relativeStartCoord.y);
    ctx.lineTo(relativeEndCoord.x, relativeEndCoord.y);
    ctx.stroke();
}