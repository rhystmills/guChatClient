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
}
const nameScreen = document.getElementById("nameScreen");
const chatScreen = document.getElementById("chatScreen");
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
        chatScreen.setAttribute("class","")
        renderMessages();
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
    const newMessages = JSON.parse(event.data);
    state.messages = newMessages;
    renderMessages();
}

window.onload = () => {
    nameField.focus();
}

// console.log(json);

// webSocket.onopen = () => {
//     const json = JSON.stringify({
//         type: "connection",
//     })
//     webSocket.send(JSON.stringify(json))
// }
