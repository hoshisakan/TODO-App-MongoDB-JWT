import axios, { AxiosError, AxiosResponse } from 'axios';
// import { RequestParameters, RequestOptions } from '../models/AxiosRequest';
import {
    UserDetails,
    UserFormValuesLogin,
    UserFormValuesRegister,
    UserLogout,
    UserLogoutSuccess,
    VerifyTokenResult,
} from '../models/User';
import { ResponseResult } from '../models/AxiosResponse';
import { toast } from 'react-toastify';
import url from 'url';

axios.defaults.baseURL = process.env.REACT_APP_API_URL;
// axios.defaults.baseURL = 'http://localhost:49146/api/v1';
// axios.defaults.baseURL = 'http//192.168.1.103:49146/api/v1';
///TODO: When cross domain request send cookie
axios.defaults.withCredentials = true;

// const request = async (axiosRequest: RequestParameters) => {
// const options: RequestOptions = {
//     method: axiosRequest.method,
//     headers: {
//         'Content-Type': 'application/json',
//     },
//     body: {},
// };

// if (axiosRequest.headers) {
//     // console.log('headers is not null');
//     options.headers = { ...options.headers, ...axiosRequest.headers };
// } else if (!axiosRequest.headers && axiosRequest.isFile) {
//     // console.log('headers is null');
//     options.headers = {};
// }

// if (axiosRequest.body && !axiosRequest.isFile) {
//     // console.log('Is not file');
//     options.body = JSON.stringify(axiosRequest.body);
// } else {
//     // console.log('Is file');
//     options.body = axiosRequest.body;
// }

// const urlApi = `${baseApi}${url}`;
// };

///TODO: response interceptors
// axios.interceptors.response.use(
//     ///TODO: If API request successfully, then the area perform additional processing
//     async (response) => {
//         return response;
//     },
//     (error: AxiosError) => {
//         const { data, status, config, headers } = error.response as AxiosResponse;

//         if (data.message) {
//             toast(data.message);
//         }

//         // switch (status) {
//         //     case 400:
//         //         break;
//         //     case 401:
//         //         break;
//         //     case 403:
//         //         break;
//         //     case 404:
//         //         break;
//         //     case 500:
//         //         break;
//         // }
//         return Promise.reject(error);
//     }
// );

const sleep = (delay: number) => {
    return new Promise((resolve) => {
        setTimeout(resolve, delay);
    });
};

axios.interceptors.response.use(
    async (response) => {
        await sleep(500);
        return response;
    },
    (error: AxiosError) => {
        const { data, status, config, headers } = error.response as AxiosResponse;
        // console.log(`error.response: ${error.response}`);
        if (config.url) {
            const requestAPIURL = url.parse(config.url).pathname;
            console.log(`requestAPIURL: ${requestAPIURL}`);
            if (requestAPIURL === '/auth/verify-token' && data.data.code === -1) {
                toast.error(data.message);
            } else {
                toast.error(data.message);
            }
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
    del: <T>(url: string) => axios.delete<T>(url).then(responseBody),
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
    refreshToken: () => requests.post<ResponseResult>,
};

const agent = {
    User,
    Auth,
};

export default agent;
