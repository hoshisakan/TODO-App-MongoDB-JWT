import { observer } from 'mobx-react-lite';
import { StyledOtherPageOutsideLayout } from '../../app/layout/styles/StyledComponents';
import useQuery from '../../app/util/hooks';
import agent from '../../app/api/agent';
import { ReSendVerifyEmailResult, UserFormValuesReSendVerifyEmail } from '../../app/models/User';
import { toast } from 'react-toastify';

const RegisterSuccessConfirmPage = observer(() => {
    const email = useQuery().get('email') as string;

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

    return (
        <StyledOtherPageOutsideLayout>
            <div className="card border-light-subtle shadow-sm opacity-75" style={{ width: '50rem' }}>
                <div className="card-body p-3 p-md-4 p-xl-5">
                    <div className="row">
                        <div className="col-12">
                            <h3>註冊成功!</h3>
                            <p style={{ fontSize: '20px' }}>請從你的信箱中收取驗證信 (包含垃圾信件)</p>
                        </div>
                    </div>
                    <div className="row">
                        {email ? (
                            <>
                                <p style={{ fontSize: '16px' }}>尚未收到驗證信? 點擊以下按鈕重新寄送驗證信</p>
                                <button type="button" className="btn btn-primary" onClick={handleConfirmEmailResend}>
                                    重寄驗證信
                                </button>
                            </>
                        ) : (
                            <>
                                <p style={{ fontSize: '16px' }}>無法讀取到電子郵件</p>
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
        </StyledOtherPageOutsideLayout>
    );
});

export default RegisterSuccessConfirmPage;
