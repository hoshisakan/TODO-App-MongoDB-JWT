import { makeAutoObservable, runInAction } from 'mobx';
import {
    UserDetails,
    UserFormValuesLogin,
    UserFormValuesRegister,
    UserLogout,
    UserLogoutSuccess,
    UserRegisterSuccess,
    VerifyTokenResult,
} from '../models/User';
import agent from '../api/agent';
import { router } from '../router/Routes';
import moment from 'moment';
import { toast } from 'react-toastify';

export default class UserStore {
    user: UserDetails | null = null;
    appLoaded: boolean = false;
    isRequiredAuthPage: boolean = false;
    refreshTokenTimeout: any = null;

    constructor() {
        makeAutoObservable(this);
    }

    get isLoggedIn() {
        const isLoggedIn = !!this.user;
        return isLoggedIn;
    }

    setApploaded = () => {
        this.appLoaded = true;
    };

    setIsRequiredAuthPage = () => {
        this.isRequiredAuthPage = true;
    };

    login = async (requestValues: UserFormValuesLogin) => {
        try {
            await agent.Auth.signin(requestValues).then((response) => {
                runInAction(() => {
                    this.user = response.data;
                    this.startRefreshTokenTimer();
                    // toast.success('Token is valid.');
                    // console.log(`login: ${JSON.stringify(this.user)}`);
                });
            });
            router.navigate('/todo');
        } catch (error: any) {
            // toast.error(error.stack);
            throw error;
        }
    };

    register = async (requestValues: UserFormValuesRegister) => {
        try {
            await agent.Auth.signup(requestValues).then((response) => {
                runInAction(() => {
                    const registerResult: UserRegisterSuccess = response.data;
                    // console.log(`registerResult: ${JSON.stringify(registerResult)}`);
                    if (registerResult.isRegisterSuccess) {
                        router.navigate(`/sign-up-success?email=${requestValues.email}`);
                    }
                });
            });
        } catch (error) {
            throw error;
        }
    };

    logout = async () => {
        try {
            // await agent.Auth.signout(requestValues).then((response) => {
            //     const result: UserLogoutSuccess = response.data;
            //     if (result.isAllowedLogout) {
            //         this.user = null;
            //         router.navigate('/sign-in');
            //     }
            // });
            await agent.Auth.signout().then((response) => {
                const result: UserLogoutSuccess = response.data;
                if (result.isAllowedLogout) {
                    this.user = null;
                    router.navigate('/sign-in');
                }
            });
        } catch (error) {
            throw error;
        }
    };

    verifyToken = async (authType: string) => {
        try {
            await agent.Auth.verifyToken(authType).then(async (response) => {
                const verifyResult: VerifyTokenResult = response.data;
                // toast.success(`Access token valid successfully.`);
                if (verifyResult.id && verifyResult.exp) {
                    await agent.Auth.current()
                        .then((response) => {
                            runInAction(() => {
                                this.user = response.data;
                                toast.success(`Access token is vaild, starting get user detail through access token.`);
                                this.startRefreshTokenTimer();
                            });
                        })
                        .catch((err) => {
                            throw err;
                        });
                }
            });
        } catch (error) {
            throw error;
        }
    };

    getCurrentUser = async () => {
        try {
            await agent.Auth.current().then((response) => {
                runInAction(() => {
                    this.user = response.data;
                    this.startRefreshTokenTimer();
                });
            });
        } catch (error) {
            throw error;
        }
    };

    refreshToken = async () => {
        this.stopRefreshTokenTimer();
        try {
            await agent.Auth.refreshToken().then((response) => {
                runInAction(() => {
                    this.user = response.data;
                    // toast.success(
                    //     `Refresh token successfully! expire time is: ${this.user?.accessTokenExpireUnixStampTime}`
                    // );
                    this.startRefreshTokenTimer();
                });
            });
        } catch (error) {
            console.log(error);
        }
    };

    private startRefreshTokenTimer() {
        try {
            // console.log(`this.user: ${JSON.stringify(this.user)}`);
            // toast.info(`this.user: ${JSON.stringify(this.user)}`);
            ///TODO: Convert timestamp to millseconds.
            // console.log(`this.user.accessTokenExpireUnixStampTime: ${this.user.accessTokenExpireUnixStampTime}, Date.now(): ${Date.now()}`);
            // multiplied by 1000 so that the argument is in milliseconds, not seconds
            if (this.user && this.user.accessTokenExpireUnixStampTime) {
                toast.info('Enable refresh token timer.');

                const expires = new Date(this.user.accessTokenExpireUnixStampTime * 1000);
                ///TODO: Convert timestamp to millseconds.
                const timeout = expires.getTime() - Date.now() - 30 * 1000;
                // const timeout = expires.getTime() - Date.now();

                // this.refreshTokenTimeout = setTimeout(this.refreshToken, timeout);
                const expiresDateString = moment(expires).format('yyyy-MM-DD HH:mm:ss');
                const timeoutDateString = moment.unix(timeout / 1000).format('mm:ss');

                if (timeout > 0 && timeout < 30000) {
                    this.refreshTokenTimeout = setTimeout(this.refreshToken, timeout);
                    // console.log(`Refresh user ${this.user.id} token that expired time is: ${expires}, timeout: ${timeout}`);
                } else if (timeout < 0) {
                    console.log(`The timeout value less than 0 millseconds.`);
                } else {
                    console.log(`The timeout value more than 0, but less than 30000 millseconds.`);
                }

                // if (timeout <= 0) {
                //     toast.warning(`Token expired! time left: ${timeoutDateString}`);
                // } else {
                //     toast.info(`Token not yet expire, time left: ${timeoutDateString}`);
                // }

                console.log(
                    `Refresh user ${this.user?.id} token that timeout: ${timeout}, accessTokenExpireUnixStampTime: ${this.user.accessTokenExpireUnixStampTime}, expiresDateString: ${expiresDateString}, timeoutDateString: ${timeoutDateString}`
                );
                // toast.info(
                //     `Refresh user ${this.user?.id} token that timeout: ${timeout}, accessTokenExpireUnixStampTime: ${this.user.accessTokenExpireUnixStampTime}, expiresDateString: ${expiresDateString}, timeoutDateString: ${timeoutDateString}`
                // );
            } else {
                toast.error('Disable refresh token timer.');
                // console.log(`User details is null.`);
                // toast.error(`User details is null. try read this.user: ${JSON.stringify(this.user)}`);
            }
        } catch (error: any) {
            console.log(error.stack);
        }
    }

    private stopRefreshTokenTimer() {
        clearTimeout(this.refreshTokenTimeout);
    }
}
