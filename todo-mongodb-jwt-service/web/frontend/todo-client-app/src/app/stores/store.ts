import TodoCategoryStore from './todoCategoryStore';
import TodoStore from './todoStore';
import UserStore from './userStore';

import { createContext, useContext } from 'react';

interface Store {
    todoStore: TodoStore;
    todoCategoryStore: TodoCategoryStore
    userStore: UserStore;
}

export const store: Store = {
    todoStore: new TodoStore(),
    todoCategoryStore: new TodoCategoryStore(),
    userStore: new UserStore(),
};

export const StoreContext = createContext(store);

export function useStore() {
    return useContext(StoreContext);
}
