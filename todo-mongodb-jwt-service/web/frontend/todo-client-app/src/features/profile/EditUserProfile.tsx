import { ChangeEvent, MouseEvent, useState } from 'react';
import { useStore } from '../../app/stores/store';
import { observer } from 'mobx-react-lite';
import { StyledIcon } from './styles/StyledComponents';
import anonymousImage from '../../assets/anonymous.png';
import { ProfileFormValuesAddOrEdit } from '../../app/models/Profile';
import { toast } from 'react-toastify';

const EditUserProfile = observer(({ onData }: any) => {
    const { profileStore } = useStore();
    const { profile, getProfileImage, editProfile, uploadPhoto } = profileStore;
    const [state, setState] = useState<ProfileFormValuesAddOrEdit>({
        bio: profile.bio,
        email: profile.email,
        displayName: profile.displayName,
    });

    const handleChange = (e: ChangeEvent<HTMLTextAreaElement | HTMLInputElement | HTMLSelectElement>) => {
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

        ///TODO: 因為 setState是非同步的方法，故會有延遲的現象發生，非即時更新，但若在 Form 提交時，所有值皆會被更新至 state 中
        console.log(`result: ${JSON.stringify(state)}`);
        // toast.info(`result: ${JSON.stringify(state)}`);
    };

    const clearFormValues = () => {
        setState({
            bio: '',
            displayName: '',
            email: '',
        });
        // toast.info('Clear form values process completed.');
    };

    const checkFormEmptyExists = (checkValues: ProfileFormValuesAddOrEdit) => {
        let result = false;
        Object.entries(checkValues).forEach(([key, value]) => {
            if (!value) {
                result = true;
            }
        });
        return result;
    };

    const toggleUpdateEvent = (e: MouseEvent<HTMLElement>) => {
        const requestValues: ProfileFormValuesAddOrEdit = state;
        console.log(`requestValues: ${JSON.stringify(requestValues)}`);
        // toast.info(`requestValues: ${JSON.stringify(requestValues)}`);
        const isEmptyExists = checkFormEmptyExists(requestValues);
        if (!isEmptyExists) {
            // toast.success('OK, will be submit form to backend server');
            editProfile(requestValues)
                .then((response: any) => {
                    clearFormValues();
                    onData(false);
                })
                .catch((err: any) => {
                    toast.error(`Error: ${err}`);
                });
        } else {
            toast.error('Find empty value in form values.');
            return;
        }
    };

    const toggleCancelEvent = (e: MouseEvent<HTMLElement>) => {
        onData(false);
    };

    const handleUploadFiles = (e: ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        const files = e.target.files;

        if (files) {
            uploadPhoto(files)
                .then((response) => {
                    toast.success(`Upload file successfully`);
                })
                .catch((err) => {
                    console.log(err);
                });
        }
        e.target.files = null;
    };

    return (
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
                                <label className="form-label">DisplayName</label>
                                <input
                                    className="form-control"
                                    name="displayName"
                                    id="displayName"
                                    value={state.displayName ?? ''}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Email</label>
                                <input
                                    className="form-control"
                                    name="email"
                                    id="email"
                                    value={state.email ?? ''}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Bio</label>
                                <textarea
                                    style={{
                                        height: '150px',
                                    }}
                                    className="form-control"
                                    name="bio"
                                    id="bio"
                                    value={state.bio ?? ''}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="mb-3">
                                <div className="input-group mb-3">
                                    <input
                                        type="file"
                                        className="form-control"
                                        id="photo_file_upload"
                                        name="photo"
                                        onChange={handleUploadFiles}
                                    />
                                </div>
                            </div>
                            <div className="mb-3">
                                <div className="row justify-content-between">
                                    <div className="col text-end">
                                        <button
                                            className="btn btn-primary m-1"
                                            type="button"
                                            onClick={toggleUpdateEvent}
                                        >
                                            Update
                                        </button>
                                        <button className="btn btn-danger" type="button" onClick={toggleCancelEvent}>
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
});

export default EditUserProfile;
