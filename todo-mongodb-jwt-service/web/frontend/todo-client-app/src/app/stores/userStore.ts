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

export default class UserStore {
    user: UserDetails | null = null;
    // isLoggedIn: Boolean = false;
    appLoaded = false;

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

    login = async (requestValues: UserFormValuesLogin) => {
        try {
            await agent.Auth.signin(requestValues).then((response) => {
                runInAction(() => {
                    this.user = response.data;
                    console.log(`UserDetails: ${JSON.stringify(this.user)}`);
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
                    console.log(`registerResult: ${JSON.stringify(registerResult)}`);
                    if (registerResult._id) {
                        router.navigate('/sign-up-success');
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
                    router.navigate('/');
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
                        console.log(`verifyToken user details: ${JSON.stringify(this.user)}`);
                    });
                }
            });
        } catch (error) {
            throw error;
        }
    };

    getCurrentUser = async () => {
        try {
            // const user = await agent.Auth.current();
            // console.log(`logout: ${JSON.stringify(user)}`);
            // runInAction(() => {
            //     this.user = user;
            //     console.log(`getCurrentUser user: ${user}`);
            // });

            await agent.Auth.current().then((response) => {
                this.user = response.data;
                console.log(`getCurrentUser user details: ${JSON.stringify(this.user)}`);
            });
        } catch (error) {
            throw error;
        }
    };
}
