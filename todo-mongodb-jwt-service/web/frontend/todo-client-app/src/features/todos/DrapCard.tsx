import { Draggable } from 'react-beautiful-dnd';
import { ListTodoItem } from '../../app/models/ListTodoItem';
import { DragItem, DragItemContent } from './styles/StyledComponents';

interface Props {
    item: ListTodoItem;
    index: number;
}

const DrapCard = ({ item, index }: Props) => {
    return (
        <Draggable key={item._id} draggableId={item._id} index={index}>
            {(provided, snapshot) => {
                return (
                    <DragItem
                        ref={provided.innerRef}
                        // snapshot={snapshot}
                        // isDragging={snapshot.isDragging}
                        // draggableStyle={provided.draggableProps.style}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                    >
                        <DragItemContent>{item.title}</DragItemContent>
                    </DragItem>
                );
            }}
        </Draggable>
    );
};

export default DrapCard;
