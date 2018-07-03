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
        console.log('token guardado')
        return data
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

// TODO cambiar el nombre de la función por algo como processMessage
const mensajeImpreso = data => {
    const now = new Date()
    const element = document.getElementById('messages-container')
    switch (data.type) {
        case "connect":
            const person = `
                <div class="user">
                    <span class="user--name">${data.from}</span>
                    <span class="user--status">En linea</span>
                </div>
            `
            if (usersConnected) usersConnected.insertAdjacentHTML('beforeend', person)
            break
        case "mensaje":
            const contenidoMensaje = `
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
            element.insertAdjacentHTML('beforeend', contenidoMensaje)  
            break
        case "giphy":
            const contenidoGiphy = `
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
                            <img src="${data.data}" alt="Este es un gif">
                        </div>
                    </div>
                </div>
            `
            element.insertAdjacentHTML('beforeend', contenidoGiphy)  
            break
        default:
            console.log('no se recibió un tipo válido')
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
                    console.log(data)
                    formRegister.innerHTML = `
                        <p>Usted ha sido registrado exitosamente ahora puede iniciar sesión</p>
                        <a href="#" id="linkLogin">Iniciar Sesión</a>
                    `
                    linkLogin.addEventListener('click', e => {
                        e.preventDefault()
                        Router.navigate('/login')
                    })
                })
        })
    }
}

const eventFormLogin = () => {
    const formLogin = document.getElementById('form-login')
    if (formLogin) {
        formLogin.addEventListener('submit', e => {
            e.preventDefault()
            let user ={
                nick_name: e.target.userName.value,
                password: e.target.userPass.value
            }
            prepareLogin(user)
            .then(data => {
                if(data.type == "ok") {
                    localStorage.setItem('user', e.target.userName.value)
                    wsInit()
                    Router.navigate('/chat')
                }
            }).catch(e => {
                console.log(e)
            })
        })
    }
}

const eventForm1 = () => {
    const form1 = document.getElementById('message-form')
    if (form1) {
        form1.addEventListener('submit', async e => {
            e.preventDefault()
            let mensajeParaEnviar = {}
            let mensajeEscrito = e.target.messageText.value
            if (mensajeEscrito.startsWith('/giphy')) {
                const q = encodeURI(mensajeEscrito.substring(7))
                const headers = new Headers()
                headers.append('Content-Type', 'application/json')
                const myInit = {
                    method: 'GET', 
                    headers: headers,  
                    mode: 'cors', 
                    cache: 'default'
                }
                const apiKey = 'mto0q23ZXsGlZDFANOaT1yeVDeR2mmwX'
                const uri = `https://api.giphy.com/v1/gifs/search?api_key=${apiKey}&q=${q}&limit=1`
                const res = await fetch(uri, myInit)
                const data = await res.json()
                // console.log(data)
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