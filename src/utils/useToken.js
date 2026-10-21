import { useRouter } from 'vue-router';
import { getAccessToken, saveAccessToken, clearAccessToken } from './adminAuth';

export function useToken() {
    const router = useRouter();

    const setToken = (token, expiryHours = 24) => {
        saveAccessToken(token, expiryHours);
    };

    const getToken = () => {
        const token = getAccessToken();
        if(!token){
            router.push('/login');
        }
        return token;
    };

    const removeToken = (relogin = false) => {
        clearAccessToken();
        if(relogin){
            router.push('/login');
        }
    };

    return {
        setToken,
        getToken,
        removeToken
    }
}
