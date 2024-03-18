import { makeAutoObservable, observable, runInAction } from 'mobx';
import agent from '../api/agent';
import { toast } from 'react-toastify';
import { TodoStatus } from '../models/TodoStatus';

export default class TodoStatusStore {
    todoStatuses: TodoStatus[] = [];

    constructor() {
        makeAutoObservable(this, {
            todoStatuses: observable,
        });
    }

    loadTodoStatuses = async () => {
        try {
            await agent.TodoStatus.list().then((response) => {
                runInAction(() => {
                    const list: TodoStatus[] = response.data;
                    // console.log(`list: ${JSON.stringify(list)}`);
                    if (list.length > 1 && !Array.isArray(list)) {
                        toast.info('Get data more than 0, but it not an array');
                    } else if (!Array.isArray(list) || list.length === 0) {
                        toast.error('Get todo data does empty or not array.');
                    } else {
                        this.setTodoStatuses(list);
                        // toast.success(`todoStatus: ${JSON.stringify(this.todoStatus)}`);
                    }
                });
            });
        } catch (error: any) {
            console.log(error);
            toast.error(error?.stack);
        }
    };

    setTodoStatuses = (todoStatuses: TodoStatus[]) => {
        this.todoStatuses = todoStatuses;
    };
}
