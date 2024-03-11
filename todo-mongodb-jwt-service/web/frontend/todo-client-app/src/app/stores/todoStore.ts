import { computed, makeAutoObservable, observable, runInAction, autorun, action } from 'mobx';
import { Todo, TodoFormValuesAddCard, TodoPatchResult, TodoValuesUpdateDropableItem } from '../models/Todo';
import agent from '../api/agent';
import { toast } from 'react-toastify';

export default class TodoStore {
    todos: Todo[] = [];
    userTodoList: { [key: string]: Todo[] } = {};
    todoStatusList = ['pending', 'ongoing', 'completed'];
    isAddedSuccess = false;

    constructor() {
        makeAutoObservable(this, {
            todos: observable,
            userTodoList: observable,
            todoStatusList: observable,
        });
    }

    loadTodos = async () => {
        try {
            // console.log(`userTodoList: ${JSON.stringify(Object.keys(this.userTodoList))}`);
            // console.log(`userTodoList: ${JSON.stringify(this.userTodoList)}`);
            await agent.Todo.list().then((response) => {
                runInAction(async () => {
                    const list: Todo[] = response.data;
                    console.log(`loadTodos list: ${JSON.stringify(list)}`);
                    if (list.length > 1 && !Array.isArray(list)) {
                        toast.info('Get data more than 0, but it not an array');
                    } else if (!Array.isArray(list) || list.length === 0) {
                        toast.error('Get todo data does empty or not array.');
                    } else {
                        await this.clearTodoRelatedItems();
                        await this.setTodos(list);
                        await Promise.all(this.todos.map((item, index) => this.setUserTodoList(item)));
                    }
                });
            });
        } catch (error: any) {
            console.log(error);
            toast.error(error?.stack);
        }
    };

    addTodo = async (requestValues: TodoFormValuesAddCard) => {
        try {
            await agent.Todo.add(requestValues)
                .then((response) => {
                    runInAction(async () => {
                        await this.loadTodos();
                        await this.setIsAddeedSuccess(true);
                    });
                })
                .catch((err) => {
                    throw new Error(err.stack);
                });
        } catch (error: any) {
            console.log(error);
            toast.error(error?.stack);
        }
    };

    statusPatch = async (id: String, requestValues: TodoValuesUpdateDropableItem) => {
        try {
            await agent.Todo.statusPatch(id, requestValues)
                .then((response) => {
                    runInAction(async () => {
                        const patchResult: TodoPatchResult = response.data;
                        if (patchResult && patchResult._id === id) {
                            await this.loadTodos();
                            console.log(`Patch ${id} item successfully.`);
                        } else {
                            throw new Error(`Patch ${id} item failed.`);
                        }
                    });
                })
                .catch(async (err) => {
                    throw new Error(err.stack);
                });
        } catch (err: any) {
            throw err;
        }
    };

    setTodos = async (todos: Todo[]) => {
        runInAction(() => {
            this.todos = todos;
        });
    };

    clearTodoRelatedItems = async () => {
        runInAction(() => {
            this.todos = [];
            this.userTodoList = {};
        });
    };

    setIsAddeedSuccess = async (isAddedSuccess: boolean) => {
        runInAction(() => {
            this.isAddedSuccess = isAddedSuccess;
            toast.warning(`todoStore change isAddedSuccess result: ${this.isAddedSuccess}`)
        });
    };

    setUserTodoList = async (item: Todo) => {
        runInAction(() => {
            if (!this.userTodoList[item.status]) {
                this.userTodoList[item.status] = [];
            }
            this.userTodoList[item.status].push(item);
        });
    };
}
