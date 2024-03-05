import { observer } from 'mobx-react-lite';
import { useState, useEffect, useCallback } from 'react';
import { router } from '../../app/router/Routes';
import { StyledOtherPageOutsideLayout } from '../../app/layout/styles/StyledComponents';
import useQuery from '../../app/util/hooks';
import agent from '../../app/api/agent';
import {
    ReSendVerifyEmailResult,
    UserFormValuesReSendVerifyEmail,
    UserFormValuesVerifyEmail,
    VerifyEmailResult,
} from '../../app/models/User';
import { toast } from 'react-toastify';

const VerifyEmaiResultPage = observer(() => {
    const token = useQuery().get('token') as string;
    const email = useQuery().get('email') as string;
    const [isActivate, setIsActivate] = useState(false);

    const handleConfirmEmailResend = async () => {
        try {
            const values: UserFormValuesReSendVerifyEmail = {
                email: email,
            };
            agent.Auth.reSendVerifyEmail(values)
                .then((response) => {
                    const result: ReSendVerifyEmailResult = response.data;
                    if (result.isReSendConfirmEmail) {
                        toast.success('寄送驗證信成功!請至你的信箱確認');
                    } else {
                        toast.error('寄送驗證信失敗，請重新操作一次');
                    }
                })
                .catch((error) => {
                    console.log(error);
                });
        } catch (err: any) {
            console.log(err);
        }
    };

    useEffect(() => {
        const values: UserFormValuesVerifyEmail = {
            token: token,
        };

        agent.Auth.verifyEmail(values)
            .then((response) => {
                const result: VerifyEmailResult = response.data;
                if (result.isVerifyed) {
                    setIsActivate(true);
                } else {
                    toast.error(result.message);
                }
            })
            .catch((err) => {
                console.log(err);
            });
    }, [isActivate, token]);

    return (
        <StyledOtherPageOutsideLayout>
            {isActivate ? (
                <div className="card border-light-subtle shadow-sm opacity-75" style={{ width: '50rem' }}>
                    <div className="card-body p-3 p-md-4 p-xl-5">
                        <div className="row">
                            <div className="col-12">
                                <h3>帳戶驗證成功!</h3>
                                <a
                                    href="/sign-in"
                                    className="btn btn-primary active"
                                    role="button"
                                    data-bs-toggle="button"
                                    aria-pressed="true"
                                >
                                    回首頁
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="card border-light-subtle shadow-sm opacity-75" style={{ width: '50rem' }}>
                    <div className="card-body p-3 p-md-4 p-xl-5">
                        <div className="row">
                            <div className="col-12">
                                <h3>註冊失敗!</h3>
                                {email ? (
                                    <>
                                        <p style={{ fontSize: '20px' }}>請重新嘗試寄送驗證郵件至你的信箱</p>
                                        <button
                                            type="button"
                                            className="btn btn-primary"
                                            onClick={handleConfirmEmailResend}
                                        >
                                            重寄驗證信
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <p style={{ fontSize: '20px' }}>無法讀取到電子郵件</p>
                                        <a
                                            href="/sign-in"
                                            className="btn btn-primary active"
                                            role="button"
                                            data-bs-toggle="button"
                                            aria-pressed="true"
                                        >
                                            回首頁
                                        </a>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </StyledOtherPageOutsideLayout>
    );
});

export default VerifyEmaiResultPage;
