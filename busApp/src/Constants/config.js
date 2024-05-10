
const SERVER_URL = 'http://localhost:10000';
//const SERVER_URL = 'http://localhost:10000';

const PYTHON_SERVER_URL= 'http://localhost:11000'

//Bypass ngrok browser warning will work with localhost as well
const axiosConfig = {
    headers: {
        'Content-Type': 'application/json',
            'ngrok-skip-browser-warning': 'true'
    }
}

const adminAddress = "sujaldhiman2003s@gmail.com";

export {SERVER_URL, axiosConfig, adminAddress,PYTHON_SERVER_URL};