import { makeAutoObservable, observable, runInAction } from 'mobx';
import agent from '../api/agent';
import { toast } from 'react-toastify';
import { Profile, ProfileFormValuesAddOrEdit, ProfileSetOrUploadPhotoResult } from '../models/Profile';

export default class ProfileStore {
    profile: Profile = {
        username: '',
        email: '',
        displayName: '',
        bio: '',
        _id: '',
        photoFileName: '',
    };
    isModifiedSuccess: boolean = false;

    constructor() {
        makeAutoObservable(this, {
            profile: observable,
            isModifiedSuccess: observable,
        });
    }

    get getProfileImage() {
        return `${process.env.REACT_APP_PHOTO_URL}/${this.profile._id}/${this.profile.photoFileName}`;
    }

    loadProfile = async () => {
        try {
            await agent.Profile.getProfile()
                .then((response) => {
                    runInAction(() => {
                        const profile: Profile = response.data;
                        this.setProfile(profile);
                        console.log(`Load profile result: ${JSON.stringify(profile)}`);
                        toast.success(`Get user profile successfully!`);
                    });
                })
                .catch((err) => {
                    throw err;
                });
        } catch (error: any) {
            console.log(error);
            // toast.error(error?.response.data.message);
        }
    };

    setIsModifiedSuccess = (isModifiedSuccess: boolean) => {
        this.isModifiedSuccess = isModifiedSuccess;
    };

    setProfile = (profile: Profile) => {
        this.profile = profile;
    };

    editProfile = async (requestValues: ProfileFormValuesAddOrEdit) => {
        try {
            await agent.Profile.setProfile(requestValues).then((response) => {
                runInAction(async () => {
                    const result: ProfileSetOrUploadPhotoResult = response.data;
                    // console.log(`registerResult: ${JSON.stringify(registerResult)}`);
                    if (result.isModifiedSuccess) {
                        await this.loadProfile();
                        this.setIsModifiedSuccess(true);
                    } else {
                        // throw new Error(result.message);
                        toast.error(result.message);
                    }
                });
            });
        } catch (error: any) {
            console.log(error);
            toast.error(error?.stack);
            throw error;
        }
    };

    uploadPhoto = async (files: FileList | null) => {
        try {
            if (!files) {
                return;
            }
            let body = new FormData();

            for (let i = 0; i < files.length; i++) {
                console.log(`file: ${files[i].name}`);
                body.append('photo', files[i], files[i].name);
            }
            await agent.Profile.uploadPhoto(body).then((response) => {
                runInAction(async () => {
                    const result: ProfileSetOrUploadPhotoResult = response.data;
                    if (result.isModifiedSuccess) {
                        await this.loadProfile();
                    } else {
                        throw new Error(result.message);
                    }
                });
            });
        } catch (error: any) {
            console.log(error);
            toast.error(error?.stack);
        }
    };
}
