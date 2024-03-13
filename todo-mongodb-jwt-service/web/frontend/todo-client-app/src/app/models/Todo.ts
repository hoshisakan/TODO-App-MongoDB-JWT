export interface Todo {
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

export interface TodoFormValuesAddOrEdit {
    title: string;
    description: string | null;
    status: string;
    startDate: string;
    dueDate: string;
    todoCategoryId: string;
}

export interface TodoValuesUpdateDropableItem {
    status: string;
}

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
    status: string;
    startDate: string;
    dueDate: string;
    user: string;
    createdAt: string;
    updatedAt: string | null;
    todoCategoryId: string;
}

export interface TodoCUDResult {
    isSuccess: boolean;
    message: string;
}