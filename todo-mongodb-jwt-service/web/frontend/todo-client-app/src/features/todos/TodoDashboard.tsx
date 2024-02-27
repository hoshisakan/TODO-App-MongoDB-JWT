import { DragDropContext, DropResult } from 'react-beautiful-dnd';
import { DropContextWrapper, StyledDashboardWrapper } from './styles/StyledComponents';
import DroppableSectionWrapper from './DroppableSectionWrapper';
import { observer } from 'mobx-react-lite';
import { useEffect, useCallback } from 'react';
import { useStore } from '../../app/stores/store';



const TodoDashboard = observer(() => {
    const { todoStore } = useStore();
    const { userTodoList } = todoStore;

    const onDragEnd = (result: DropResult) => {
        const { source, destination } = result;
        if (!destination) {
            return;
        }
        let newItemObj = { ...userTodoList };
        ///TODO: Force convert droppableId of source to newItemObj object that key type
        const sourceDroppableId = source.droppableId as keyof typeof newItemObj;
        // console.log(`sourceDroppableId: ${sourceDroppableId}`);
        ///TODO: Remove drapped object from newItemObj array
        const [remove] = newItemObj[sourceDroppableId].splice(source.index, 1);
        // console.log(`remove: ${JSON.stringify(remove)}`);
        ///TODO: Force convert droppableId of destination to newItemObj object that key type
        const destinationDroppableId = destination.droppableId as keyof typeof newItemObj;
        // console.log(`destinationDroppableId: ${destinationDroppableId}`);
        newItemObj[destinationDroppableId].splice(destination.index, 0, remove);
        // console.log(`userTodoList: ${JSON.stringify(userTodoList)}`);
    };

    /*
        加入 useCallback 後，只有當依賴列表中的 todoStore 狀態被變更時，才會指向 loadTodos 新的記憶體位址；
        否則，將會指向同一個 loadTodos 方法 (即是同一個記憶體位址)
    */
    const loadTodosCallback = useCallback(() => {
        todoStore.loadTodos();
        // todoStore.loadUserItemObj();
    }, [todoStore]); // 依賴列表

    const capitalizeFirstLetter = (word: string) => {
        return word.charAt(0).toUpperCase() + word.slice(1);
    }

    /*
        避免重複渲染 loadTodos 方法，故使用 useCallback 僅在todoStore 狀態被變更時，才會調用其方法；
        否則，會造成 loadTodos 方法重複被持續調用，形成一個無限迴圈，
        原因是每次都會產生一個新的 loadTodos 方法，個別指向不同的記憶體位址
    */
    useEffect(() => {
        loadTodosCallback();
    }, [loadTodosCallback]);

    // useEffect(() => {
    //     loadTodos();
    // }, [loadTodos, todoStore]);

    return (
        <StyledDashboardWrapper>
            <DragDropContext onDragEnd={onDragEnd}>
                <DropContextWrapper>
                    {Object.keys(userTodoList).map((status, index) => (
                        <DroppableSectionWrapper
                            droppableObjName={capitalizeFirstLetter(status)}
                            droppableId={status}
                            items={userTodoList[status]}
                            key={`droppable_${status}`}
                        />
                    ))}
                </DropContextWrapper>
            </DragDropContext>
        </StyledDashboardWrapper>
    );
});

export default TodoDashboard;
