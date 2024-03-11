import { makeAutoObservable, observable, runInAction } from 'mobx';
import agent from '../api/agent';
import { toast } from 'react-toastify';
import { TodoCategory } from '../models/TodoCategory';

export default class TodoCategoryStore {
    todoCategories: TodoCategory[] = [];

    constructor() {
        makeAutoObservable(this, {
            todoCategories: observable,
        });
    }

    loadTodoCategories = async () => {
        try {
            await agent.TodoCategory.list().then((response) => {
                runInAction(() => {
                    const list: TodoCategory[] = response.data;
                    // console.log(`list: ${JSON.stringify(list)}`);
                    if (list.length > 1 && !Array.isArray(list)) {
                        toast.info('Get data more than 0, but it not an array');
                    } else if (!Array.isArray(list) || list.length === 0) {
                        toast.error('Get todo data does empty or not array.');
                    } else {
                        this.setTodoCategories(list);
                        // toast.success(`todoCategory: ${JSON.stringify(this.todoCategories)}`);
                    }
                });
            });
        } catch (error: any) {
            console.log(error);
            toast.error(error?.stack);
        }
    };

    setTodoCategories = (todoCategories: TodoCategory[]) => {
        this.todoCategories = todoCategories;
    };
}
