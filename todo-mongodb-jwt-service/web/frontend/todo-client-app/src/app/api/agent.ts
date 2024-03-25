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
// import url from 'url';
import { TodoFormValuesAddOrEdit, TodoValuesUpdateDropableItem } from '../models/Todo';
import { ProfileFormValuesAddOrEdit } from '../models/Profile';

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
    post: <T>(url: string, body = {}, headers = {}) => axios.post<T>(url, body).then(responseBody),
    put: <T>(url: string, body: {}) => axios.put<T>(url, body).then(responseBody),
    patch: <T>(url: string, body: {}) => axios.patch<T>(url, body).then(responseBody),
    del: <T>(url: string) => axios.delete<T>(url).then(responseBody),
};

const Profile = {
    getProfile: () => requests.get<ResponseResult>('/profile/get-profile'),
    setProfile: (entity: ProfileFormValuesAddOrEdit) => requests.post<ResponseResult>('/profile/set-profile', entity),
    // uploadPhoto: (file: Blob) => {
    //     let formData = new FormData();
    //     formData.append('photo', file);
    // return axios.post<ResponseResult>('/profile/upload-photo', formData, {
    //     headers: { 'Content-type': 'multipart/form-data' },
    // });
    // return requests.post<ResponseResult>('/profile/upload-photo', file, { 'Content-type': 'multipart/form-data' });
    // },
    uploadPhoto: (files: FormData) =>
        requests.post<ResponseResult>('/profile/upload-photo', files, { 'Content-type': 'multipart/form-data' }),
};

const TodoCategory = {
    list: () => requests.get<ResponseResult>('/todoCategory'),
};

const TodoStatus = {
    list: () => requests.get<ResponseResult>('/todoStatus'),
};

const Todo = {
    list: () => requests.get<ResponseResult>('/todo'),
    add: (entity: TodoFormValuesAddOrEdit) => requests.post<ResponseResult>('/todo', entity),
    statusPatch: (id: string, entity: TodoValuesUpdateDropableItem) =>
        requests.patch<ResponseResult>(`/todo/${id}`, entity),
    detail: (id: string) => requests.get<ResponseResult>(`/todo/${id}`),
    remove: (id: string) => requests.del<ResponseResult>(`/todo/${id}`),
    update: (id: string, entity: TodoFormValuesAddOrEdit) => requests.put<ResponseResult>(`/todo/${id}`, entity),
};

const User = {
    detail: (id: string) => requests.get<ResponseResult>(`user/${id}`),
    // update: (id: string) => requests.put<ResponseResult>(`/user/${id}`, entity),
};

const Auth = {
    current: () => requests.get<ResponseResult>('/auth/current-user'),
    verifyToken: (authType: string) => requests.post<ResponseResult>(`/auth/verify-token`, { authType: authType }),
    signin: (entity: UserFormValuesLogin) => requests.post<ResponseResult>(`/auth/signin`, entity),
    signup: (entity: UserFormValuesRegister) => requests.post<ResponseResult>(`/auth/signup`, entity),
    // signout: (entity: UserLogout) => requests.post<ResponseResult>(`/auth/signout`, entity),
    signout: () => requests.post<ResponseResult>(`/auth/signout`),
    refreshToken: () => requests.get<ResponseResult>(`/auth/refresh-token`),
    reSendVerifyEmail: (entity: UserFormValuesReSendVerifyEmail) =>
        requests.post<ResponseResult>(`/auth/re-send-confirm-email`, entity),
    verifyEmail: (entity: UserFormValuesVerifyToken) => requests.post<ResponseResult>(`/auth/verify-email`, entity),
    applyResetPassword: (entity: UserFormValuesApplyResetPasssword) =>
        requests.post<ResponseResult>(`/auth/forget-password`, entity),
    verifyResetPasswordToken: (entity: UserFormValuesVerifyToken) =>
        requests.post<ResponseResult>(`/auth/verify-reset-password-token`, entity),
    resetPassword: (entity: UserFormValuesResetPasssword) =>
        requests.post<ResponseResult>(`/auth/reset-password`, entity),
};

const agent = {
    Todo,
    TodoCategory,
    TodoStatus,
    User,
    Auth,
    Profile,
};

export default agent;
