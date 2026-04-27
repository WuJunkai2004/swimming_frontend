import { useRouter } from 'vue-router';
import { saveData, getData, removeData } from './useStorage';

export function useToken() {
    const router = useRouter();

    const setToken = (token) => {
        saveData('token', token, 24);
    };

    const getToken = () => {
        const token = getData('token');
        if(!token){
            router.push('/login');
        }
        return token;
    };

    const removeToken = (relogin = false) => {
        removeData('token');
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
