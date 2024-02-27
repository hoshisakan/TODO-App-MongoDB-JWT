export interface UserDetails {
    _id: string;
    username: string;
    email: string;
    roles: Array<string>;
    accessTokenExpireTime: number;
}

export interface UserFormValuesLogin {
    username: string;
    // email: string;
    password: string;
}

export interface UserFormValuesRegister {
    username: string;
    email: string;
    password: string;
    roles: Array<string>
}

export interface UserLogout {
    username: string;
    email: string;
}

export interface UserLogoutSuccess {
    isAllowedLogout: Boolean;
    message: string;
}

export interface VerifyTokenResult {
    id: string;
    iat: Number;
    exp: Number;
}

export interface RefreshTokenResult {
    token: String;
    expireTime: Number;
}

export interface UserRegisterSuccess {
    _id: string;
    username: string,
    email: string,
    roles: Array<string>
}
