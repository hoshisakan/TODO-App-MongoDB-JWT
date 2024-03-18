import { makeAutoObservable, observable, runInAction } from 'mobx';
import {
    Todo,
    TodoDetail,
    TodoCUDResult,
    TodoFormValuesAddOrEdit,
    TodoPatchResult,
    TodoValuesUpdateDropableItem,
    TodoUpdateOrPatchResult,
} from '../models/Todo';
import agent from '../api/agent';
import { toast } from 'react-toastify';
import moment from 'moment';

export default class TodoStore {
    todos: Todo[] = [];
    userTodoList: { [key: string]: Todo[] } = {};
    todoStatusList: Array<string> = ['pending', 'ongoing', 'completed'];
    isAddedSuccess: boolean = false;
    isEditedSuccess: boolean = false;
    isRemovedSuccess: boolean = false;
    editedTodoId: string = '';
    removedTodoId: string = '';
    editDetail: TodoDetail = {
        _id: '',
        title: '',
        description: null,
        startDate: '',
        dueDate: '',
        user: '',
        createdAt: '',
        updatedAt: null,
        todoCategoryId: '',
        todoStatusId: '',
    };

    constructor() {
        makeAutoObservable(this, {
            todos: observable,
            userTodoList: observable,
            todoStatusList: observable,
            isAddedSuccess: observable,
            isEditedSuccess: observable,
            isRemovedSuccess: observable,
            editedTodoId: observable,
            removedTodoId: observable,
            editDetail: observable,
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

    detailTodo = async (id: string) => {
        try {
            await agent.Todo.detail(id)
                .then((response) => {
                    runInAction(() => {
                        const detail: TodoDetail = response.data;
                        detail.startDate = moment(detail.startDate).format('YYYY-MM-DD HH:mm:ss');
                        detail.dueDate = moment(detail.dueDate).format('YYYY-MM-DD HH:mm:ss');
                        this.setTodoDetail(detail);
                        console.log(`Get todo detail: ${JSON.stringify(this.editDetail)}`);
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

    editTodo = async (id: string, requestValues: TodoFormValuesAddOrEdit) => {
        try {
            await agent.Todo.update(id, requestValues)
                .then((response) => {
                    runInAction(async () => {
                        const editResult: TodoCUDResult = response.data;
                        // console.log(`editResult: ${JSON.stringify(editResult)}`);
                        if (editResult.isSuccess && !editResult.message) {
                            await this.loadTodos();
                            await this.setIsEditedSuccess(true);
                        } else {
                            throw new Error(editResult.message);
                        }
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

    addTodo = async (requestValues: TodoFormValuesAddOrEdit) => {
        try {
            await agent.Todo.add(requestValues)
                .then((response) => {
                    runInAction(async () => {
                        const addResult: TodoCUDResult = response.data;
                        // console.log(`addResult: ${JSON.stringify(addResult)}`);
                        if (addResult.isSuccess && !addResult.message) {
                            await this.loadTodos();
                            await this.setIsAddeedSuccess(true);
                        } else {
                            throw new Error(addResult.message);
                        }
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
                        const removeResult: TodoCUDResult = response.data;
                        // console.log(`removeResult: ${JSON.stringify(removeResult)}`);
                        if (removeResult.isSuccess && !removeResult.message) {
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

    statusPatch = async (id: string, requestValues: TodoValuesUpdateDropableItem) => {
        try {
            await agent.Todo.statusPatch(id, requestValues)
                .then((response) => {
                    runInAction(async () => {
                        const patchResult: TodoUpdateOrPatchResult = response.data;
                        if (patchResult.isModifiedSuccess) {
                            await this.loadTodos();
                            console.log(`Patch ${id} item successfully.`);
                        } else {
                            toast.error(`Patch ${id} item failed.`);
                        }
                    });
                })
                .catch(async (err) => {
                    toast.error(`Patch`);
                });
        } catch (err: any) {
            throw err;
        }
    };

    setTodoDetail = async (detail: TodoDetail) => {
        runInAction(() => {
            this.editDetail = detail;
        });
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

    setRemovedTodoId = (removedTodoId: string) => {
        this.removedTodoId = removedTodoId;
    };

    setEditedTodoId = (editedTodoId: string) => {
        this.editedTodoId = editedTodoId;
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
