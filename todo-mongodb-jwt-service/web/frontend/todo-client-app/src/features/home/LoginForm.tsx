import { useStore } from '../../app/stores/store';
import { UserFormValuesLogin } from '../../app/models/User';

export default function LoginForm() {
    const { userStore } = useStore();

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const username: string = document.querySelector<HTMLInputElement>('input[name="username"]')?.value || '';
        const password: string = document.querySelector<HTMLInputElement>('input[name="password"]')?.value || '';

        if (!username || !password) {
            alert('Invalid input.');
            return;
        }

        const requestValues: UserFormValuesLogin = {
            username: username,
            password: password,
        };

        userStore.login(requestValues).catch((err) => {
            // alert(err);
            // alert('login failed')
        });
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
                                        <h3>登入畫面</h3>
                                    </div>
                                </div>
                            </div>
                            <form onSubmit={handleSubmit}>
                                <div className="row gy-3 gy-md-4 overflow-hidden">
                                    <div className="col-12">
                                        <label className="form-label">
                                            使用者名稱 或是 電子郵件 <span className="text-danger">*</span>
                                        </label>
                                        <input
                                            // type="email"
                                            type="text"
                                            className="form-control"
                                            name="username"
                                            id="username"
                                            placeholder="username or email"
                                            required
                                        />
                                    </div>
                                    <div className="col-12">
                                        <label className="form-label">
                                            密碼 <span className="text-danger">*</span>
                                        </label>
                                        <input
                                            type="password"
                                            className="form-control"
                                            name="password"
                                            id="password"
                                            // value=""
                                            required
                                        />
                                    </div>
                                    <div className="col-12">
                                        <div className="d-grid">
                                            <button className="btn bsb-btn-xl btn-primary" type="submit">
                                                登入
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </form>
                            <div className="row">
                                <div className="col-12">
                                    <hr className="mt-5 mb-4 border-secondary-subtle" />
                                    <div className="d-flex justify-content-between">
                                        <a href="sign-up" className="link-secondary text-decoration-none">
                                            註冊
                                        </a>
                                        <a href="/forget-password" className="link-secondary text-decoration-none">
                                            忘記密碼?
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
