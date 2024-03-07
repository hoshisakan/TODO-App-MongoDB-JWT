export interface UserDetails {
    id: string;
    username: string;
    email: string;
    roles: string;
    accessTokenExpireUnixStampTime: number;
}

export interface UserFormValuesLogin {
    username: string;
    password: string;
}

export interface UserFormValuesRegister {
    username: string;
    email: string;
    password: string;
    roles: Array<string>;
}

export interface UserLogout {
    username: string;
    email: string;
}

export interface UserLogoutSuccess {
    isAllowedLogout: boolean;
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
    messge: string;
    isRegisterSuccess: boolean;
    isSendConfirmEmailSuccess: boolean;
}

export interface UserFormValuesReSendVerifyEmail {
    email: string;
}

export interface ReSendVerifyEmailResult {
    isReSendConfirmEmail: boolean;
    message: string;
}

export interface UserFormValuesVerifyToken {
    token: string;
}

export interface VerifyEmailResult {
    isVerifyed: boolean;
    message: string;
}

export interface UserFormValuesApplyResetPasssword {
    email: string;
}

export interface ApplyResetPasswordResult {
    isSendResetPasswordEmail: boolean;
    message: string;
}

export interface VerifyResetPasswordTokenResult {
    isVerifyed: boolean;
    resetUserEmail: string;
    message: string;
}

export interface UserFormValuesResetPasssword {
    token: string;
    email: string;
    newPassword: string;
}

export interface ResetPasswordResult {
    isResetSuccess: boolean;
    message: string;
}