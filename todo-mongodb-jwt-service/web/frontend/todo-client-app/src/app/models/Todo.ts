export interface Todo {
    _id: string;
    title: string;
    description: string | null;
    startDate: string;
    dueDate: string;
    user: string;
    category: string;
    status: string;
    createdAt: string;
    updatedAt: string | null;
}

export interface TodoFormValuesAddOrEdit {
    title: string;
    description: string | null;
    startDate: string;
    dueDate: string;
    todoCategoryId: string;
    todoStatusId: string;
}

export interface TodoValuesUpdateDropableItem {
    status: string;
}

///TODO: 前後端需要配合調整 status 的值
export interface TodoPatchResult {
    _id: string;
    title: string;
    description: string | null;
    status: string;
    startDate: string;
    dueDate: string;
    user: string;
    category: string;
    createdAt: string;
    updatedAt: string | null;
}

export interface TodoDetail {
    _id: string;
    title: string;
    description: string | null;
    startDate: string;
    dueDate: string;
    user: string;
    createdAt: string;
    updatedAt: string | null;
    todoCategoryId: string;
    todoStatusId: string;
}

export interface TodoCUDResult {
    isSuccess: boolean;
    message: string;
}

export interface TodoUpdateOrPatchResult {
    isModifiedSuccess: boolean;
    message: string;
}
