import Cookies from 'js-cookie';
import { useRouter } from 'vue-router';

const router = useRouter();

export function setToken(token){
    Cookies.set('token', token, { expires: 1 });
}

export function getToken(){
    const token = Cookies.get('token');
    if(!token){;
        router.push('/login');
    }
    return token;
}

export function removeToken(relogin = false){
    Cookies.remove('token');
    if(relogin){
        router.push('/login');
    }
}
