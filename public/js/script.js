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
                    `
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
    }
}