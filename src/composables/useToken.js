import Cookies from 'js-cookie';
import { useRouter } from 'vue-router';

export function useToken() {
    const router = useRouter();

    const setToken = (token) => {
        Cookies.set('token', token, { expires: 1 });
    };

    const getToken = () => {
        const token = Cookies.get('token');
        if(!token){
            router.push('/login');
        }
        return token;
    };

    const removeToken = (relogin = false) => {
        Cookies.remove('token');
        if(relogin){
            console.log(router);
            router.push('/login');
        }
    };

    return {
        setToken,
        getToken,
        removeToken
    }
}
