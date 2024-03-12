import { makeAutoObservable, observable, runInAction } from 'mobx';
import {
    Todo,
    TodoFormValuesAddCard,
    TodoPatchResult,
    TodoRemoveResult,
    TodoValuesUpdateDropableItem,
} from '../models/Todo';
import agent from '../api/agent';
import { toast } from 'react-toastify';

export default class TodoStore {
    todos: Todo[] = [];
    userTodoList: { [key: string]: Todo[] } = {};
    todoStatusList: Array<string> = ['pending', 'ongoing', 'completed'];
    isAddedSuccess: boolean = false;
    isEditedSuccess: boolean = false;
    isRemovedSuccess: boolean = false;
    editedTodoCardId: string = '';
    removedTodoCardId: string = '';

    constructor() {
        makeAutoObservable(this, {
            todos: observable,
            userTodoList: observable,
            todoStatusList: observable,
        });
    }

    loadTodos = async () => {
        try {
            await agent.Todo.list().then((response) => {
                runInAction(async () => {
                    const list: Todo[] = response.data;
                    // console.log(`loadTodos list: ${JSON.stringify(list)}`);
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
            // toast.error(error?.stack);
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

    removeTodo = async (id: string) => {
        try {
            await agent.Todo.remove(id)
                .then((response) => {
                    runInAction(async () => {
                        const removeResult: TodoRemoveResult = response.data;
                        console.log(`removeResult: ${JSON.stringify(removeResult)}`);
                        if (removeResult.isRemovedSuccess && !removeResult.message) {
                            await this.loadTodos();
                            await this.setIsRemovedSuccess(true);
                        } else {
                            throw new Error(removeResult.message);
                        }
                    });
                })
                .catch((err) => {
                    throw new Error(err.stack);
                });
        } catch (error: any) {
            console.log(error);
            // toast.error(`Remove error: ${error?.stack}`);
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

    setRemovedTodoCardId = (removedTodoCardId: string) => {
        this.removedTodoCardId = removedTodoCardId;
    };

    setEditedTodoCardId = (editedTodoCardId: string) => {
        this.editedTodoCardId = editedTodoCardId;
    };

    setIsRemovedSuccess = async (isRemovedSuccess: boolean) => {
        runInAction(() => {
            this.isRemovedSuccess = isRemovedSuccess;
            // toast.warning(`todoStore change isRemovedSuccess result: ${this.isRemovedSuccess}`);
        });
    };

    setIsEditedSuccess = async (isEditedSuccess: boolean) => {
        runInAction(() => {
            this.isEditedSuccess = isEditedSuccess;
            // toast.warning(`todoStore change isEditedSuccess result: ${this.isEditedSuccess}`);
        });
    };

    setIsAddeedSuccess = async (isAddedSuccess: boolean) => {
        runInAction(() => {
            this.isAddedSuccess = isAddedSuccess;
            // toast.warning(`todoStore change isAddedSuccess result: ${this.isAddedSuccess}`);
        });
    };

    setUserTodoList = async (item: Todo) => {
        runInAction(() => {
            if (!this.userTodoList[item.status]) {
                this.userTodoList[item.status] = [];
            }
            this.userTodoList[item.status].push(item);
        });
        // console.log(`userTodoList after: ${JSON.stringify(this.userTodoList)}`);
        // toast.warning(`userTodoList after: ${JSON.stringify(Object.keys(this.userTodoList))}`);
    };
}
