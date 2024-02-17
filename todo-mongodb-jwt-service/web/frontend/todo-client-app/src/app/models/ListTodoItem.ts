export interface ListTodoItemModel {
    _id: string;
    title: string;
    // description: string | null;
    status: string;
    priority: string;
    isCompleted: boolean;
    type: string;
    startDate: string;
    dueDate: string | null;
    category: string
}
