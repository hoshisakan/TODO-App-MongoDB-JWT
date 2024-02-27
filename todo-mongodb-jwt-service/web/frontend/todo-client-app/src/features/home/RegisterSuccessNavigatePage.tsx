import { observer } from 'mobx-react-lite';
import { useState, useEffect } from 'react';
import { router } from '../../app/router/Routes';

const RegisterSuccessNavigatePage = observer(() => {
    const [counter, setCounter] = useState(15);

    useEffect(() => {
        const countDown = setInterval(() => {
            setCounter(counter - 1);
            if (counter === 0) {
                router.navigate('/');
            }
        }, 1000);

        return () => clearInterval(countDown);
    }, [counter]);

    return (
        <div className="vh-100 d-flex justify-content-center align-items-center text-center">
            <div className="card border-light-subtle shadow-sm opacity-75" style={{ width: '50rem' }}>
                <div className="card-body p-3 p-md-4 p-xl-5">
                    <div className="row">
                        <div className="col-12">
                            <h3>註冊成功!</h3>
                            <h4>即將轉跳至登入頁面: {counter}
                            &nbsp;
                            <a href='/'>或按此直接進入登入頁面</a>
                            </h4>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
});

export default RegisterSuccessNavigatePage;
