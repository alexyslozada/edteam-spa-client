const apiURL = 'http://localhost:9393/api'
const apiRegister = apiURL + '/v1/register'
const apiLogin = apiURL + '/v1/login'

const prepareRegister = async user => {
    const data = await executeService(apiRegister, 'POST', user)
    return data
}

const prepareLogin = async user => {
    const data = await executeService(apiLogin, 'POST', user)
    if (data.type === 'ok') {
        localStorage.setItem('token', data.data)
    }

    return data
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
    if (resp.status === 401) {
        return {type: 'error', data: 'No autorizado'}
    }
    const json = await resp.json()
    return json
}

const mensajeImpreso = data => {
    if (data.type === 'mensaje') {
        const now = new Date()
        const contenido = `
            <div class="message">
                <div class="message--avatar">
                    <img src="https://www.gravatar.com/avatar/00000000000000000000000000000000?d=retro&f=y" alt="User Avatar">
                </div>
                <div class="message--info">
                    <div class="message--user">
                        <span class="message--user_name">${data.from}</span>
                        <span class="message--user_time">${now.getHours()}:${now.getMinutes()}</span>
                    </div>
                    <div class="message--content">
                        ${data.data}
                    </div>
                </div>
            </div>
        `
        const element = document.getElementById('messages-container')
        element.innerHTML = element.innerHTML + contenido
    }
    if (data.type === 'connect') {
        const contenido = `
            <div class="user">
                <span class="user--name">${data.from}</span>
                <span class="user--status">En linea</span>
            </div>
        `
        const element = document.getElementById('users')
        if (element) element.insertAdjacentHTML('beforeend', contenido)
    }
    if (data.type === 'giphy') {
        const now = new Date()
        const contenido = `
            <div class="message">
                <div class="message--avatar">
                    <img src="https://www.gravatar.com/avatar/00000000000000000000000000000000?d=retro&f=y" alt="User Avatar">
                </div>
                <div class="message--info">
                    <div class="message--user">
                        <span class="message--user_name">${data.from}</span>
                        <span class="message--user_time">${now.getHours()}:${now.getMinutes()}</span>
                    </div>
                    <div class="message--content">
                        <img src="${data.data}" alt="un gif bonito">
                    </div>
                </div>
            </div>
        `
        const element = document.getElementById('messages-container')
        element.insertAdjacentHTML('beforeend', contenido)
    }
}

// Código necesario para escribir en tiempo real los mensajes con WebSockets

const eventFormRegister = () => {
    const formRegister = document.getElementById('form-registro')
    if (formRegister) {
        formRegister.addEventListener('submit', e => {
            e.preventDefault()
            let user = {
                nick_name: e.target.userName.value,
                password: e.target.userPass.value
            }
            prepareRegister(user)
                .then(data => {
                    formRegister.innerHTML = `
                        <p>Usted ha sido registrado exitosamente ahora puede iniciar sesión</p>
                        <p>Qué está pasando</p>
                        <a href="#" id='btnLogin'>Iniciar sesión</a>
                    `
                    btnLogin.addEventListener('click', e => {
                        e.preventDefault()
                        Router.navigate('/login')})
                })
        })
    }
}

const eventFormLogin = () => {
    const formLogin = document.getElementById('form-login')
    if (formLogin) {
        formLogin.addEventListener('submit', async e => {
            e.preventDefault()
            let user ={
                nick_name: e.target.userName.value,
                password: e.target.userPass.value
            }
            const data = await prepareLogin(user)
            if(data.type == "ok") {
                localStorage.setItem('user', e.target.userName.value)
                wsInit()
                Router.navigate('/chat')
            }
            if (data.type === 'error') {
                formLogin.insertAdjacentHTML('beforeend', `<div id='message'>${data.data}</div>`)
            }
        })
    }
}

const eventForm1 = () => {
    const form1 = document.getElementById('message-form')
    if (form1) {
        form1.addEventListener('submit', async e => {
            e.preventDefault()
            const mensajeEscrito = e.target.messageText.value
            const mensajeParaEnviar = {}
            if (mensajeEscrito.startsWith('/giphy')) {
                const q = encodeURI(mensajeEscrito.substring(7))
                const headers = new Headers()
                headers.append('Content-Type', 'application/json')
                const myInit = {method: 'GET', headers: headers,  mode: 'cors', cache: 'default'}
                const res = await fetch(`https://api.giphy.com/v1/gifs/search?api_key=mto0q23ZXsGlZDFANOaT1yeVDeR2mmwX&q=${q}&limit=1`, myInit)
                const data = await res.json()

                mensajeParaEnviar.type = 'giphy'
                mensajeParaEnviar.data = data.data[0].images.fixed_height.url
            } else {
                mensajeParaEnviar.type = 'mensaje'
                mensajeParaEnviar.data = mensajeEscrito
            }
            ws.send(JSON.stringify(mensajeParaEnviar))
            e.target.messageText.value = ""
    })
    }
}