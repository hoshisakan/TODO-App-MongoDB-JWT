// import { ErrorMessage, Form, Formik } from 'formik';
// import * as Yup from 'yup';
import { useStore } from '../../app/stores/store';
import { UserFormValuesRegister } from '../../app/models/User';

export default function RegisterForm() {
    const { userStore } = useStore();

    // const handleScreenSize = () => {
    //     const screenRelatedInfo = `${window.screen.height}, ${window.screen.width}`;
    //     alert(screenRelatedInfo);
    // };

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const username: string = document.querySelector<HTMLInputElement>('input[name="username"]')?.value || '';
        const email: string = document.querySelector<HTMLInputElement>('input[name="email"]')?.value || '';
        const password: string = document.querySelector<HTMLInputElement>('input[name="password"]')?.value || '';

        if (!username || !password || !email) {
            alert('Invalid input.');
            return;
        }

        const requestValues: UserFormValuesRegister = {
            username: username,
            email: email,
            password: password,
            roles: []
        };

        userStore.register(requestValues).catch((err) => {
            console.log(err.response.data.message);
        });
    };

    return (
        <div className="card border-light-subtle shadow-sm opacity-75">
            <div className="card-body p-3 p-md-4 p-xl-5">
                <div className="row">
                    <div className="col-12">
                        <div className="mb-5">
                            <h3>註冊畫面</h3>
                        </div>
                    </div>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="row gy-3 gy-md-4 overflow-hidden">
                        <div className="col-12">
                            <label className="form-label">
                                使用者名稱 <span className="text-danger">*</span>
                            </label>
                            <input
                                // type="email"
                                type="text"
                                className="form-control"
                                name="username"
                                id="username"
                                placeholder="username"
                                required
                            />
                        </div>
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
                                    註冊
                                </button>
                            </div>
                        </div>
                    </div>
                </form>
                <div className="row">
                    <div className="col-12">
                        <hr className="mt-5 mb-4 border-secondary-subtle" />
                        <div className="d-flex justify-content-between">
                            <div className="link-secondary text-decoration-none"></div>
                            <a href="/" className="link-secondary text-decoration-none">
                                已經有帳號?
                            </a>
                        </div>
                    </div>
                </div>
                {/* <div className="row"></div> */}
            </div>
        </div>
    );
}
