import { makeAutoObservable, reaction, runInAction } from 'mobx';
// import { observer } from 'mobx-react-lite';
import { ListTodoItem } from '../models/ListTodoItem';

export default class TodoStore {
    todos: ListTodoItem[] = [];
    // userTodoList = new Map<string, ListTodoItem[]>();
    // userTodoList: { [key: string]: any[] } = {};
    userTodoList: { [key: string]: ListTodoItem[] } = {};
    loadTodosCount: number = 0;

    constructor() {
        makeAutoObservable(this);
    }

    loadTodos = async () => {
        try {
            const fakeData: ListTodoItem[] = [
                {
                    _id: '65cc550178b0f7e2914e9d64',
                    title: 'Test Create Todo List250955155',
                    status: 'doing',
                    priority: 'low',
                    isCompleted: false,
                    type: 'private',
                    startDate: '2024-01-03T00:47:00Z',
                    dueDate: '2024-01-08T00:47:00Z',
                    category: 'Test50',
                },
                {
                    _id: '65cc550178b0f7e2914e9d65',
                    title: 'Test Create Todo List250955156',
                    status: 'pending',
                    priority: 'low',
                    isCompleted: false,
                    type: 'private',
                    startDate: '2024-01-03T00:47:00Z',
                    dueDate: '2024-01-08T00:47:00Z',
                    category: 'Test50',
                },
                {
                    _id: '65cc550178b0f7e2914e9d66',
                    title: 'Test Create Todo List305552',
                    status: 'completed',
                    priority: 'low',
                    isCompleted: false,
                    type: 'private',
                    startDate: '2024-01-03T00:47:00Z',
                    dueDate: '2024-01-08T00:47:00Z',
                    category: 'Test50',
                },
                {
                    _id: '65cc550178b0f7e2914e9d67',
                    title: 'Test Create Todo Lis45055553',
                    status: 'pending',
                    priority: 'low',
                    isCompleted: false,
                    type: 'private',
                    startDate: '2024-01-03T00:47:00Z',
                    dueDate: '2024-01-08T00:47:00Z',
                    category: 'Test50',
                },
            ];
            this.setTodos(fakeData);

            this.todos.map((item, index) => (
                this.setUserTodoList(item)
            ));

            console.log(`userTodoList: ${JSON.stringify(Object.keys(this.userTodoList))}`);
            // console.log(`userTodoList: ${JSON.stringify(this.userTodoList)}`);
        } catch (error) {
            console.log(error);
        }
    };

    setTodos = (todos: ListTodoItem[]) => {
        this.todos = todos;
    };

    setUserTodoList = (item: ListTodoItem) => {
        if (!this.userTodoList[item.status]) {
            this.userTodoList[item.status] = [];
        }
        this.userTodoList[item.status].push(item);
    };
}
