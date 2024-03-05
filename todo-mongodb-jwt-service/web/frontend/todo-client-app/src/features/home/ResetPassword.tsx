import { observer } from 'mobx-react-lite';
import { useState, useEffect } from 'react';
import { StyledOtherPageOutsideLayout } from '../../app/layout/styles/StyledComponents';
import useQuery from '../../app/util/hooks';
import agent from '../../app/api/agent';
import {
    ResetPasswordResult,
    UserFormValuesResetPasssword,
    UserFormValuesVerifyToken,
    VerifyResetPasswordTokenResult,
} from '../../app/models/User';
import { toast } from 'react-toastify';
import { router } from '../../app/router/Routes';

const ResetPassword = observer(() => {
    const token = useQuery().get('token') as string;
    const email = useQuery().get('email') as string;
    const [isAllowedReset, setIsAllowedReset] = useState(false);

    const handleResetPasswordResultPage = async (event: React.FormEvent<HTMLFormElement>) => {
        try {
            event.preventDefault();
            const newPassword: string =
                document.querySelector<HTMLInputElement>('input[name="new-password"]')?.value || '';
            const reNewPassword: string =
                document.querySelector<HTMLInputElement>('input[name="re-new-password"]')?.value || '';

            console.log(`${newPassword}, ${reNewPassword}`);

            if (newPassword !== reNewPassword) {
                alert('密碼必須相同');
                return;
            }

            const values: UserFormValuesResetPasssword = {
                token: token,
                email: email,
                newPassword: newPassword,
            };
            agent.Auth.resetPassword(values)
                .then((response) => {
                    const result: ResetPasswordResult = response.data;
                    if (result.isResetSuccess) {
                        toast.success(`重設密碼成功`);
                        router.navigate('/reset-password-success');
                    } else {
                        toast.error(result.message);
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
        const values: UserFormValuesVerifyToken = {
            token: token,
        };

        agent.Auth.verifyResetPasswordToken(values)
            .then((response) => {
                const result: VerifyResetPasswordTokenResult = response.data;
                if (result.isVerifyed) {
                    setIsAllowedReset(true);
                } else {
                    toast.error(result.message);
                    router.navigate('/sign-in');
                }
            })
            .catch((err) => {
                console.log(err);
            });
    }, [isAllowedReset, token]);

    return (
        <>
            {isAllowedReset && (
                <div className="container-fluid">
                    <div className="row justify-content-center">
                        <div className="col-md-5">
                            <div className="card border-light-subtle shadow-sm opacity-75">
                                <div className="card-body p-3 p-md-4 p-xl-5">
                                    <div className="row">
                                        <div className="col-12">
                                            <div className="mb-5">
                                                <h3>重設密碼畫面</h3>
                                            </div>
                                        </div>
                                    </div>
                                    <form onSubmit={handleResetPasswordResultPage}>
                                        <div className="row gy-3 gy-md-4 overflow-hidden">
                                            <div className="col-12">
                                                <label className="form-label">
                                                    輸入密碼 <span className="text-danger">*</span>
                                                </label>
                                                <input
                                                    type="password"
                                                    className="form-control"
                                                    name="new-password"
                                                    id="new-password"
                                                    // value=""
                                                    required
                                                />
                                            </div>
                                            <div className="col-12">
                                                <label className="form-label">
                                                    再次輸入新密碼 <span className="text-danger">*</span>
                                                </label>
                                                <input
                                                    type="password"
                                                    className="form-control"
                                                    name="re-new-password"
                                                    id="re-new-password"
                                                    // value=""
                                                    required
                                                />
                                            </div>
                                            <div className="col-12">
                                                <div className="d-grid">
                                                    <button className="btn bsb-btn-xl btn-primary" type="submit">
                                                        送出
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
});

export default ResetPassword;
