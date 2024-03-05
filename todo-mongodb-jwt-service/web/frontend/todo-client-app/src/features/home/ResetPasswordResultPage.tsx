import { observer } from 'mobx-react-lite';

const ResetPasswordResultPage = observer(() => {
    return (
        <div className="container-fluid">
            <div className="row justify-content-center align-content-center">
                <div className="card border-light-subtle shadow-sm opacity-75" style={{ width: '50rem' }}>
                    <div className="card-body p-3 p-md-4 p-xl-5 text-center">
                        <h3>重設密碼成功!</h3>
                        <a
                            href="/sign-in"
                            className="btn btn-primary btn-lg active"
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
    );
});

export default ResetPasswordResultPage;
