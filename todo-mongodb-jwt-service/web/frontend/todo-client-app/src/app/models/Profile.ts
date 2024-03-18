export interface Profile {
    _id: string;
    username: string;
    email: string;
    displayName: string;
    bio: string;
    photoFileName: string;
}

export interface ProfileFormValuesAddOrEdit {
    bio: string;
    displayName: string;
    email: string;
}

export interface ProfileSetOrUploadPhotoResult {
    isModifiedSuccess: boolean;
    message: string;
}
