import { observer } from 'mobx-react-lite';
import { StyledOtherPageOutsideLayout } from './styles/StyledComponents';
// import { useStore } from '../../app/stores/store';

export default observer(function NotFound() {
    // const {
    //     userStore: { isLoggedIn },
    // } = useStore();

    return (
        <StyledOtherPageOutsideLayout>
            <div className="card mx-auto">
                <div className="card-body">
                    <h5 className="card-title">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="165"
                            height="35"
                            fill="currentColor"
                            className="bi bi-search"
                            viewBox="0 0 16 16"
                        >
                            <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0" />
                        </svg>
                    </h5>
                    <p className="card-text">
                        Oops - we've looked everywhere but could not find what you are looking for!
                    </p>
                    <a href="/" className="btn btn-primary btn-sm">
                        Return to home page
                    </a>
                </div>
            </div>
        </StyledOtherPageOutsideLayout>
    );
});
