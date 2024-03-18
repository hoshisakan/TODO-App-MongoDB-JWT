import { MouseEvent, useCallback, useEffect, useState } from 'react';
import { useStore } from '../../app/stores/store';
import { observer } from 'mobx-react-lite';
import { StyledIcon } from '../profile/styles/StyledComponents';
import anonymousImage from '../../assets/anonymous.png';
import EditUserProfile from './EditUserProfile';

const UserProfile = observer(() => {
    const { profileStore } = useStore();
    const { profile, getProfileImage } = profileStore;

    const [isEnableEdit, setIsEnableEdit] = useState(false);

    const toggleEditEvent = (e: MouseEvent<HTMLElement>, isEnable: boolean) => {
        setIsEnableEdit(isEnable);
    };

    /*
        加入 useCallback 後，只有當依賴列表中的 profileStore 狀態被變更時，才會指向 loadTodos 新的記憶體位址；
        否則，將會指向同一個 loadTodoRelatedDataCallback 方法 (即是同一個記憶體位址)
    */
    const loadProfileRelatedDataCallback = useCallback(() => {
        profileStore.loadProfile();
    }, [profileStore]); // 依賴列表

    /*
        避免重複渲染 loadProfile 方法，故使用 useCallback 僅在 profileStore 狀態被變更時，才會調用其方法；
        否則，會造成 loadProfile 方法重複被持續調用，形成一個無限迴圈，
        原因是每次都會產生一個新的 loadProfile 方法，個別指向不同的記憶體位址
    */
    useEffect(() => {
        loadProfileRelatedDataCallback();
    }, [loadProfileRelatedDataCallback]);

    return (
        <div className="container-fluid">
            <div className="row d-flex justify-content-center align-items-center vh-100">
                {isEnableEdit ? (
                    <EditUserProfile onData={toggleEditEvent} />
                ) : (
                    <div className="card mb-3 p-4" style={{ maxWidth: '1012px' }}>
                        <div className="row d-flex align-items-center">
                            <div className="col-5 d-flex align-items-center">
                                <StyledIcon className="bi bi-person-fill h2 me-2" />
                                <h5>About {profile.username}</h5>
                            </div>
                        </div>
                        <div className="card mb-1">
                            <div className="row g-0">
                                <div className="col-md-5">
                                    <img
                                        src={getProfileImage ?? anonymousImage}
                                        className="img-fluid rounded-start"
                                        alt="..."
                                        style={{ height: '455px', width: '512px', objectFit: 'fill' }}
                                    />
                                </div>
                                <div className="col-md-7">
                                    <div className="card-body">
                                        <div className="mb-3">
                                            <div className="d-flex align-items-end">
                                                <button
                                                    id="edit_profile_btn"
                                                    className="btn btn-primary ms-auto"
                                                    onClick={(e) => toggleEditEvent(e, true)}
                                                >
                                                    Edit
                                                </button>
                                            </div>
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label">DisplayName</label>
                                            <span className="form-control">{profile.displayName}</span>
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label">Email</label>
                                            <span className="form-control">{profile.email}</span>
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label">Bio</label>
                                            <span
                                                className="form-control"
                                                style={{
                                                    overflowY: 'auto',
                                                    height: '150px',
                                                    display: 'inline-block',
                                                    wordWrap: 'break-word',
                                                    overflowWrap: 'break-word',
                                                }}
                                            >
                                                {profile.bio}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
});

export default UserProfile;
