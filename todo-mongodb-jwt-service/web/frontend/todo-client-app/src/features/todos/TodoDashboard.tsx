import { DragDropContext, DropResult } from 'react-beautiful-dnd';
import { DragCardItemAddButton, DropContextWrapper, StyledDashboardWrapper } from './styles/StyledComponents';
import DroppableSectionWrapper from './DroppableSectionWrapper';
import { observer } from 'mobx-react-lite';
import { useEffect, useCallback, useRef } from 'react';
import { useStore } from '../../app/stores/store';
import AddTodoItem from './AddTodoItem';
import { Modal as BootstrapModal } from 'bootstrap';
import { toast } from 'react-toastify';

const TodoDashboard = observer(() => {
    const { todoStore, todoCategoryStore } = useStore();
    const { userTodoList, todoStatusList, statusPatch } = todoStore;
    const bsModalRef = useRef<InstanceType<typeof BootstrapModal> | null>(null);

    const showModal = async () => {
        bsModalRef.current?.show();
    };

    const onDragEnd = (result: DropResult) => {
        try {
            const { source, destination } = result;

            if (!destination) {
                return;
            }
            let newItemObj = { ...userTodoList };
            ///TODO: Force convert droppableId of source to newItemObj object that key type
            ///TODO: Get status from source and destination that droppableId
            // const sourceCardStatus = source.droppableId as keyof typeof newItemObj;
            // const destinationCardStatus = destination.droppableId as keyof typeof newItemObj;
            const sourceCardStatus = source.droppableId;
            const destinationCardStatus = destination.droppableId;

            if (!sourceCardStatus || !destinationCardStatus) {
                throw new Error(`Disable drag object, because sourceCardStatus or destinationCardStatus is null.`);
            }

            const sourceIndex = source.index ?? -1;
            const destinationIndex = destination.index ?? -1;

            const isExistSourceStatus = !!newItemObj[sourceCardStatus];
            const isExistDestinationStatus = !!newItemObj[destinationCardStatus];

            const checkItems = {
                sourceCardStatus,
                destinationCardStatus,
                sourceIndex: sourceIndex,
                destinationIndex: destinationIndex,
                isExistSourceStatus: isExistSourceStatus,
                isExistDestinationStatus: isExistDestinationStatus,
            };

            console.log(`checkItems: ${JSON.stringify(checkItems)}`);

            if (isExistSourceStatus) {
                const removeSourceCardItemId = newItemObj[sourceCardStatus][sourceIndex]._id;
                ///TODO: If update todo category record success, then update page todo items
                statusPatch(removeSourceCardItemId, { status: destinationCardStatus }).catch((err) => {
                    throw new Error(err);
                });
            } else {
                throw new Error(`The ${sourceCardStatus} doesn't exists in user todo list.`);
            }
        } catch (err: any) {
            toast.error(`${err}`);
        }
    };

    /*
        加入 useCallback 後，只有當依賴列表中的 todoStore 狀態被變更時，才會指向 loadTodos 新的記憶體位址；
        否則，將會指向同一個 loadTodoRelatedDataCallback 方法 (即是同一個記憶體位址)
    */
    const loadTodoRelatedDataCallback = useCallback(() => {
        todoStore.loadTodos();
        todoCategoryStore.loadTodoCategories();
    }, [todoStore, todoCategoryStore]); // 依賴列表

    const capitalizeFirstLetter = (word: string) => {
        return word.charAt(0).toUpperCase() + word.slice(1);
    };

    /*
        避免重複渲染 loadTodos 方法，故使用 useCallback 僅在todoStore 狀態被變更時，才會調用其方法；
        否則，會造成 loadTodos 方法重複被持續調用，形成一個無限迴圈，
        原因是每次都會產生一個新的 loadTodos 方法，個別指向不同的記憶體位址
    */
    useEffect(() => {
        loadTodoRelatedDataCallback();
    }, [loadTodoRelatedDataCallback]);

    return (
        <StyledDashboardWrapper className="container-fluid p-1 m-3">
            <AddTodoItem />
            <div className="row">
                <div className="col-12">
                    <DragCardItemAddButton
                        id={`add_card_btn`}
                        type="button"
                        className="btn btn-danger btn-sm"
                        data-bs-toggle="modal"
                        data-bs-target="#staticBackdrop"
                        onClick={showModal}
                    >
                        Add Todo
                    </DragCardItemAddButton>
                </div>
            </div>
            <div className="row p-5">
                <div className="col-9">
                    <DragDropContext onDragEnd={onDragEnd}>
                        <DropContextWrapper>
                            {todoStatusList.map((status, index) => (
                                <DroppableSectionWrapper
                                    droppableObjName={capitalizeFirstLetter(status)}
                                    droppableId={status}
                                    items={userTodoList[status]}
                                    key={`droppable_${status}`}
                                />
                            ))}
                        </DropContextWrapper>
                    </DragDropContext>
                </div>
            </div>
        </StyledDashboardWrapper>
    );
});

export default TodoDashboard;
