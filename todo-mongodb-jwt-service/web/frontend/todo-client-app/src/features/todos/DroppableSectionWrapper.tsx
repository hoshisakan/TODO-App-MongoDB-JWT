import { Droppable } from 'react-beautiful-dnd';
import DrapCard from './DrapCard';
import { ListTodoItemModel } from '../../app/models/ListTodoItem';
import { DragItemHeader, DroppableContainer, OutsideSectionWrapper, StyledDroppable } from './styles/StyledComponents';

interface Props {
    droppableObjName: string;
    droppableId: string;
    items: ListTodoItemModel[];
}

const DroppableSectionWrapper = ({ droppableObjName, droppableId, items }: Props) => {
    return (
        <OutsideSectionWrapper>
            {/* <h5>{droppableObjName}</h5> */}
            <StyledDroppable droppableId={droppableId}>
                {(provided, snapshot) => (
                    <DroppableContainer ref={provided.innerRef} {...provided.droppableProps}>
                        <DragItemHeader>{droppableObjName}</DragItemHeader>
                        {items.map((item, index) => (
                            <DrapCard item={item} index={index} />
                        ))}
                        {provided.placeholder}
                    </DroppableContainer>
                )}
            </StyledDroppable>
        </OutsideSectionWrapper>
    );
};

export default DroppableSectionWrapper;
