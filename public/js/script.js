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

// prepareRegister()
prepareLogin()
