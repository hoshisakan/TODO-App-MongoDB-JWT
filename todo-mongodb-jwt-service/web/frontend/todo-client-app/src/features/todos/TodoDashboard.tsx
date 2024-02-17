// import './TodoItemStyle.css';
import { ListTodoItemModel } from '../../app/models/ListTodoItem';
import { DragDropContext, DropResult } from 'react-beautiful-dnd';
import { useState } from 'react';
import { DropContextWrapper, StyledDashboardDiv } from './styles/StyledComponents';
import DroppableSectionWrapper from './DroppableSectionWrapper';



const TodoDashboard = () => {
    const rawData: ListTodoItemModel[] = [
        {
            _id: '65cc550178b0f7e2914e9d65',
            title: 'Test Create Todo List2509551555555555555555555555555555555555555',
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
            status: 'pending',
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
    const tempData: ListTodoItemModel[] = [];
    const tempDataSec: ListTodoItemModel[] = [];

    const [itemObj, setItemObj] = useState({
        pending: {
            items: rawData,
        },
        doing: {
            items: tempData,
        },
        completed: {
            items: tempDataSec,
        },
    });

    const onDragEnd = (result: DropResult) => {
        const { source, destination } = result;

        if (!destination) {
            return;
        }

        let newItemObj = { ...itemObj };

        ///TODO: Force convert droppableId of source to newItemObj object that key type
        const sourceDroppableId = source.droppableId as keyof typeof newItemObj;
        // console.log(`sourceDroppableId: ${sourceDroppableId}`);

        ///TODO: Remove drapped object from newItemObj array
        const [remove] = newItemObj[sourceDroppableId].items.splice(source.index, 1);
        // console.log(`remove: ${JSON.stringify(remove)}`);

        ///TODO: Force convert droppableId of destination to newItemObj object that key type
        const destinationDroppableId = destination.droppableId as keyof typeof newItemObj;
        // console.log(`destinationDroppableId: ${destinationDroppableId}`);
        newItemObj[destinationDroppableId].items.splice(destination.index, 0, remove);

        ///TODO: Update changed item to object array
        setItemObj(newItemObj);
    };

    return (
        <StyledDashboardDiv>
            <DragDropContext onDragEnd={onDragEnd}>
                <DropContextWrapper>
                    <DroppableSectionWrapper
                        droppableObjName={'Pending'}
                        droppableId={'pending'}
                        items={itemObj.pending.items}
                    />
                    <DroppableSectionWrapper
                        droppableObjName={'Doing'}
                        droppableId={'doing'}
                        items={itemObj.doing.items}
                    />
                    <DroppableSectionWrapper
                        droppableObjName={'Completed'}
                        droppableId={'completed'}
                        items={itemObj.completed.items}
                    />
                </DropContextWrapper>
            </DragDropContext>
        </StyledDashboardDiv>
    );
};

export default TodoDashboard;
