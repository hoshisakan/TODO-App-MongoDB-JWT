import { toast } from 'react-toastify';
import agent from '../../app/api/agent';
import { ApplyResetPasswordResult, UserFormValuesApplyResetPasssword } from '../../app/models/User';

export default function ApplResetPassword() {
    const handleApplyResetPassword = (event: React.FormEvent<HTMLFormElement>) => {
        try {
            event.preventDefault();
            const email: string = document.querySelector<HTMLInputElement>('input[name="email"]')?.value || '';

            if (!email) {
                alert('Invalid input.');
                return;
            }

            const requestValues: UserFormValuesApplyResetPasssword = {
                email: email,
            };

            agent.Auth.applyResetPassword(requestValues)
                .then((response) => {
                    const result: ApplyResetPasswordResult = response.data;
                    if (result.isSendResetPasswordEmail) {
                        toast.success('寄送重設密碼驗證信成功!請至你的信箱確認');
                    } else {
                        toast.error('寄送重設密碼驗證信失敗，請重新操作一次');
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
        <div className="container-fluid">
            <div className="row justify-content-center">
                <div className="col-md-5">
                    <div className="card border-light-subtle shadow-sm opacity-75">
                        <div className="card-body p-3 p-md-4 p-xl-5">
                            <div className="row">
                                <div className="col-12">
                                    <div className="mb-5">
                                        <h3>申請重設密碼畫面</h3>
                                    </div>
                                </div>
                            </div>
                            <form onSubmit={handleApplyResetPassword}>
                                <div className="row gy-3 gy-md-4 overflow-hidden">
                                    <div className="col-12">
                                        <label className="form-label">
                                            電子郵件 <span className="text-danger">*</span>
                                        </label>
                                        <input
                                            type="email"
                                            className="form-control"
                                            name="email"
                                            id="email"
                                            placeholder="email"
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
    );
}
