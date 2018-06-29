const apiURL = 'http://localhost:9393/api'
const apiRegister = apiURL + '/v1/register'
const apiLogin = apiURL + '/v1/login'

const prepareRegister = async () => {
    const user = {
        nick_name : 'jenny',
        password : '159'
    }
    const data = await executeService(apiRegister, 'POST', user)
    console.log(data)
}

const prepareLogin = async () => {
    const user = {
        nick_name : 'jenny',
        password : '159'
    }
    const data = await executeService(apiLogin, 'POST', user)
    if (data.type === 'ok') {
        localStorage.setItem('token', data.data)
        console.log('token guardado')
    }
}

const executeService = async (uri, met, user) => {
    const header = new Headers()
    header.append('Content-Type', 'application/json')

    const myInit = {
        method : met,
        headers : header,
        body : JSON.stringify(user)
    }

    const resp = await fetch(uri, myInit)
    const json = await resp.json()
    return json
}

//prepareRegister()
prepareLogin()

const mensajeImpreso = data => {
    let contenido = `
        <div class="message">
            <div class="message--avatar">
                <img src="https://www.gravatar.com/avatar/00000000000000000000000000000000?d=retro&f=y" alt="User Avatar">
            </div>
            <div class="message--info">
                <div class="message--user">
                    <span class="message--user_name">${data.from}</span>
                    <span class="message--user_time">${new Date() / 1000}</span>
                </div>
                <div class="message--content">
                    ${data.data}
                </div>
            </div>
        </div>
    `
    if (data.data) {
        let element = document.getElementById('messages-container')
        element.innerHTML = element.innerHTML + contenido
    }
}

// Código necesario para escribir en tiempo real los mensajes con WebSockets

const user1 = 'jenny'
const token1 = localStorage.getItem('token')
const wsURL = `ws://localhost:9393/ws?nick=${user1}&token=${token1}`

const ws = new WebSocket(wsURL);
ws.onopen = () => { console.log("Se ha establecido conexión con el websocket") }
ws.onerror = error => { console.log(error) }

ws.onmessage = mensaje => { 
    console.log(mensaje.data)
    mensajeImpreso(JSON.parse(mensaje.data))
}


const form1 = document.getElementById('message-form')

form1.addEventListener('submit', e => {
    e.preventDefault()
    let mensajeEscrito = e.target.messageText.value
    let mensajeParaEnviar = {
        type: "mensaje",
        data: mensajeEscrito
    }
    ws.send(JSON.stringify(mensajeParaEnviar))
    e.target.messageText.value = ""
})


//ws.send()