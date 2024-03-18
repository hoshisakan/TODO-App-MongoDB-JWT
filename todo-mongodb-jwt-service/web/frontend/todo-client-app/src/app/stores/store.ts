import ProfileStore from './profileStore';
import TodoCategoryStore from './todoCategoryStore';
import TodoStatusStore from './todoStatusStore';
import TodoStore from './todoStore';
import UserStore from './userStore';

import { createContext, useContext } from 'react';

interface Store {
    todoStore: TodoStore;
    todoCategoryStore: TodoCategoryStore;
    todoStatusStore: TodoStatusStore;
    userStore: UserStore;
    profileStore: ProfileStore;
}

export const store: Store = {
    todoStore: new TodoStore(),
    todoCategoryStore: new TodoCategoryStore(),
    todoStatusStore: new TodoStatusStore(),
    userStore: new UserStore(),
    profileStore: new ProfileStore(),
};

export const StoreContext = createContext(store);

export function useStore() {
    return useContext(StoreContext);
}
