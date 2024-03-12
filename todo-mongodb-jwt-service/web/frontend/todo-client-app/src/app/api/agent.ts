import axios, { AxiosError, AxiosResponse } from 'axios';
import {
    UserFormValuesApplyResetPasssword,
    UserFormValuesLogin,
    UserFormValuesReSendVerifyEmail,
    UserFormValuesRegister,
    UserFormValuesResetPasssword,
    UserFormValuesVerifyToken,
    UserLogout,
} from '../models/User';
import { ResponseResult } from '../models/AxiosResponse';
import { toast } from 'react-toastify';
import url from 'url';
import { TodoFormValuesAddCard, TodoValuesUpdateDropableItem } from '../models/Todo';

axios.defaults.baseURL = process.env.REACT_APP_API_URL;
///TODO: When cross domain request send cookie
axios.defaults.withCredentials = true;

const sleep = (delay: number) => {
    return new Promise((resolve) => {
        setTimeout(resolve, delay);
    });
};

axios.interceptors.request.use((config) => {
    // const token = store.commonStore.token;
    // if (token && config.headers) {
    //     config.headers.Authorization = `Bearer ${token}`;
    // }
    // console.log(`axios request config content: ${JSON.stringify(config)}`);
    return config;
});

axios.interceptors.response.use(
    async (response) => {
        await sleep(500);
        return response;
    },
    (error: AxiosError) => {
        const { data, status, config, headers } = error.response as AxiosResponse;
        // console.log(`error.response: ${error.response}`);
        if (config.url) {
            // const requestAPIURL = url.parse(config.url).pathname;
            // console.log(`requestAPIURL: ${requestAPIURL}`);
            toast.error(data.message);
        }
        return Promise.reject(error);
    }
);

// axios.interceptors.response.use(undefined, (error) => {
//     if (error.response.data) {
//         toast.error(error.response.data.message);
//     }
//     return Promise.reject(error);
// });

const responseBody = <T>(response: AxiosResponse<T>) => response.data;

const requests = {
    get: <T>(url: string) => axios.get<T>(url).then(responseBody),
    post: <T>(url: string, body: {}) => axios.post<T>(url, body).then(responseBody),
    put: <T>(url: string, body: {}) => axios.put<T>(url, body).then(responseBody),
    patch: <T>(url: string, body: {}) => axios.patch<T>(url, body).then(responseBody),
    del: <T>(url: string) => axios.delete<T>(url).then(responseBody),
};

const TodoCategory = {
    list: () => requests.get<ResponseResult>('/todoCategory'),
};

const Todo = {
    list: () => requests.get<ResponseResult>('/todo'),
    add: (todo: TodoFormValuesAddCard) => requests.post<ResponseResult>('/todo', todo),
    remove: (id: String) => requests.del<ResponseResult>(`/todo/${id}`),
    statusPatch: (id: String, todo: TodoValuesUpdateDropableItem) =>
        requests.patch<ResponseResult>(`/todo/${id}`, todo),
};

const User = {
    details: (id: string) => requests.get<ResponseResult>(`user/${id}`),
};

const Auth = {
    current: () => requests.get<ResponseResult>('/auth/account-info'),
    verifyToken: (authType: string) => requests.post<ResponseResult>(`/auth/verify-token`, { authType: authType }),
    signin: (user: UserFormValuesLogin) => requests.post<ResponseResult>(`/auth/signin`, user),
    signup: (user: UserFormValuesRegister) => requests.post<ResponseResult>(`/auth/signup`, user),
    signout: (user: UserLogout) => requests.post<ResponseResult>(`/auth/signout`, user),
    refreshToken: () => requests.get<ResponseResult>(`/auth/refresh-token`),
    reSendVerifyEmail: (user: UserFormValuesReSendVerifyEmail) =>
        requests.post<ResponseResult>(`/auth/re-send-confirm-email`, user),
    verifyEmail: (user: UserFormValuesVerifyToken) => requests.post<ResponseResult>(`/auth/verify-email`, user),
    applyResetPassword: (user: UserFormValuesApplyResetPasssword) =>
        requests.post<ResponseResult>(`/auth/forget-password`, user),
    verifyResetPasswordToken: (user: UserFormValuesVerifyToken) =>
        requests.post<ResponseResult>(`/auth/verify-reset-password-token`, user),
    resetPassword: (user: UserFormValuesResetPasssword) => requests.post<ResponseResult>(`/auth/reset-password`, user),
};

const agent = {
    Todo,
    TodoCategory,
    User,
    Auth,
};

export default agent;
