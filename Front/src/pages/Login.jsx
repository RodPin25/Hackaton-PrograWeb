import LoginModal from "../components/LoginModal";
import { api } from "../services/api";

function getToken(){
    const token = localStorage.getItem("Token");
    return token;
}
function Login(){
    const [token, setToken] = ""

    setToken = getToken();

    if(!token){
        console.log('Usuario incorrecto');
    } 

    try{
        const token = api.getMe(); //Este endpoint solo esta de prueba, cuando este el bueo para autenticar token entonces se cambia
        if(!token){
            console.log('Usuario no encontrado.');
            //No redireccionar.
            return (
                <LoginModal></LoginModal>
            )
        }

        //Si el token es valido que aun espero el endpoint para validar el token.

    } catch(err){
        console.error(err);
    }
}
