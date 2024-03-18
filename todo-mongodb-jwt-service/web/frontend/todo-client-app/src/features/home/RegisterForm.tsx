import { useStore } from '../../app/stores/store';
import { UserFormValuesRegister } from '../../app/models/User';
import { ChangeEvent, FormEvent, useState } from 'react';
import { toast } from 'react-toastify';

export default function RegisterForm() {
    const { userStore } = useStore();
    const [state, setState] = useState<UserFormValuesRegister>({
        username: '',
        email: '',
        displayName: '',
        password: '',
        roles: [],
    });

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const name = e.target.name;
        const value = e.target.value;

        // setState((prevState) => {
        //     // Object.assign would also work
        //     return { ...prevState, [name]: value };
        // });

        setState((prevValue) => ({
            ...prevValue,
            [name]: value,
        }));

        ///TODO: 因為 setState 是非同步的方法，故會有延遲的現象發生，非即時更新，但若在 Form 提交時，所有值皆會被更新至 state 中
        // console.log(`result: ${JSON.stringify(state)}`);
        // toast.info(`result: ${JSON.stringify(state)}`);
    };

    const clearFormValues = () => {
        setState({
            username: '',
            email: '',
            displayName: '',
            password: '',
            roles: [],
        });
        // toast.info('Clear form values process completed.');
    };

    const checkFormEmptyExists = (checkValues: UserFormValuesRegister) => {
        let result = false;
        Object.entries(checkValues).forEach(([key, value]) => {
            if (key !== 'role' && !value) {
                result = true;
            }
        });
        return result;
    };

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const requestValues: UserFormValuesRegister = state;
        const isEmptyExists = checkFormEmptyExists(requestValues);

        if (!isEmptyExists) {
            userStore
                .register(requestValues)
                .then((res) => {
                    clearFormValues();
                })
                .catch((err) => {
                    console.log(err);
                });
        } else {
            toast.error('Find empty value in form values.');
            return;
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
                                        <h3>註冊畫面</h3>
                                    </div>
                                </div>
                            </div>
                            <form onSubmit={handleSubmit}>
                                <div className="row gy-3 gy-md-4 overflow-hidden">
                                    <div className="col-12">
                                        <label className="form-label">
                                            顯示名稱 <span className="text-danger">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            name="displayName"
                                            id="displayName"
                                            placeholder="displayName"
                                            value={state.displayName}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                    <div className="col-12">
                                        <label className="form-label">
                                            使用者名稱 <span className="text-danger">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            name="username"
                                            id="username"
                                            placeholder="username"
                                            value={state.username}
                                            onChange={handleChange}
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
                                            value={state.email}
                                            onChange={handleChange}
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
                                            value={state.password}
                                            onChange={handleChange}
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
                                        <a href="/sign-in" className="link-secondary text-decoration-none">
                                            已經有帳號?
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
