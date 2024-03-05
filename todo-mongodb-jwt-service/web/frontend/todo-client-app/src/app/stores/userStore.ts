import { makeAutoObservable, reaction, runInAction } from 'mobx';
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

export default class UserStore {
    user: UserDetails | null = null;
    appLoaded = false;
    isRequiredAuthPage = false;
    refreshTokenTimeout: any;

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
                    // alert(`analysis result: ${JSON.stringify(response)}`);
                    this.user = response.data;
                    console.log(`UserDetails: ${JSON.stringify(this.user)}`);
                    // alert(`UserDetails: ${JSON.stringify(this.user)}`);
                    this.startRefreshTokenTimer(this.user);
                });
            });
            router.navigate('/todo');
        } catch (error) {
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

    logout = async (requestValues: UserLogout) => {
        try {
            await agent.Auth.signout(requestValues).then((response) => {
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

                if (verifyResult.id) {
                    await agent.User.details(response.data.id).then((response) => {
                        this.user = response.data;
                        // console.log(`verifyToken user details: ${JSON.stringify(this.user)}`);
                        this.startRefreshTokenTimer(this.user);
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
                this.user = response.data;
                // console.log(`getCurrentUser user details: ${JSON.stringify(this.user)}`);
                this.startRefreshTokenTimer(this.user);
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
                    const user: UserDetails = response.data;
                    console.log(`refreshToken user: ${user}`);
                    this.startRefreshTokenTimer(user);
                });
            });
        } catch (error) {
            console.log(error);
        }
    };

    private startRefreshTokenTimer(user: UserDetails | null) {
        try {
            if (user && user.accessTokenExpireTime) {
                ///TODO: Convert timestamp to millseconds.
                // console.log(`user.accessTokenExpireTime: ${user.accessTokenExpireTime}, Date.now(): ${Date.now()}`);
                // multiplied by 1000 so that the argument is in milliseconds, not seconds
                const expires = new Date(user.accessTokenExpireTime * 1000);
                ///TODO: Convert timestamp to millseconds.
                const timeout = expires.getTime() - Date.now() - 30 * 1000;
                this.refreshTokenTimeout = setTimeout(this.refreshToken, timeout);
                // console.log(this.refreshTokenTimeout);
                // console.log(`Refresh user ${user._id} token that expired time is: ${expires}, timeout: ${timeout}`);
                const expiresDateString = moment(expires).format('yyyy-MM-DD HH:mm:ss');
                const timeoutDateString = moment.unix(timeout / 1000).format('mm:ss');

                console.log(
                    `Refresh user ${user._id} token that expiresDateString: ${expiresDateString}, timeoutDateString: ${timeoutDateString}`
                );
            } else {
                console.log(`User details is null.`);
            }
        } catch (error) {
            console.log(error);
        }
    }

    private stopRefreshTokenTimer() {
        clearTimeout(this.refreshTokenTimeout);
    }
}
