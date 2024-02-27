import { useState } from 'react';
import { Button, Card, Container } from 'react-bootstrap';
import { Draggable, DragDropContext, Droppable, DropResult } from 'react-beautiful-dnd';
import { ListTodoItem } from '../../app/models/ListTodoItem';
import './TestLayoutStyle.css';

const items = [
    {
        _id: '65cc550178b0f7e2914e9d67',
        title: 'test1 title',
        description: 'test description1',
        status: 'pending',
        priority: 'low',
        isCompleted: true,
        type: 'private',
        startDate: new Date(),
        dueDate: new Date(),
        category: 'test1',
    },
    {
        _id: '65cc550178b0f7e2914e9d66',
        title: 'test2 title',
        description: 'test description2',
        status: 'pending',
        priority: 'low',
        isCompleted: true,
        type: 'private',
        startDate: new Date(),
        dueDate: new Date(),
        category: 'test2',
    },
    {
        _id: '65cc550178b0f7e2914e9d65',
        title: 'test3 title',
        description: 'test description3',
        status: 'pending',
        priority: 'low',
        isCompleted: true,
        type: 'private',
        startDate: new Date(),
        dueDate: new Date(),
        category: 'test3',
    },
];

// const items = [
//     {
//         _id: '1',
//         name: 'Study Spanish',
//     },
//     {
//         _id: '2',
//         name: 'Workout',
//     },
//     {
//         _id: '3',
//         name: 'Film Youtube',
//     },
//     {
//         _id: '4',
//         name: 'Grocery Shop',
//     },
// ];

const getItemStyle = (isDragging: boolean, draggableStyle: any) => ({
    padding: 10,
    margin: `0 50px 15px 50px`,
    // background: isDragging ? '#4a2975' : 'white',
    background: isDragging ? 'green' : 'white',
    color: isDragging ? 'white' : 'black',
    border: `1px solid black`,
    fontSize: `20px`,
    borderRadius: `5px`,
    ...draggableStyle,
});

export default function TestLayoutLoading() {
    const [fakeData, setFakeData] = useState(items);

    const onDragEnd = (result: DropResult) => {
        console.log('test');
        const { source, destination } = result;

        if (!destination) {
            return;
        }

        const items = Array.from(fakeData);
        const [newOrder] = items.splice(source.index, 1);
        items.splice(destination.index, 0, newOrder);

        setFakeData(items);
    };

    return (
        <>
            <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId="todo">
                    {(provided) => (
                        <div className="todo" {...provided.droppableProps} ref={provided.innerRef}>
                            {fakeData.map(({ _id, title }, index) => {
                                return (
                                    <Draggable key={_id} draggableId={_id.toString()} index={index}>
                                        {(provided, snapshot) => (
                                            <div
                                                ref={provided.innerRef}
                                                {...provided.draggableProps}
                                                {...provided.dragHandleProps}
                                                style={getItemStyle(snapshot.isDragging, provided.draggableProps.style)}
                                            >
                                                {title}
                                            </div>
                                        )}
                                    </Draggable>
                                );
                            })}
                            {provided.placeholder}
                        </div>
                    )}
                </Droppable>
            </DragDropContext>
        </>
    );
}
