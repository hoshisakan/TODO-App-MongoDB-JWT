import DrapCard from './DrapCard';
import { ListTodoItem } from '../../app/models/ListTodoItem';
import { DragItemHeader, DroppableContainer, OutsideSectionWrapper, StyledDroppable } from './styles/StyledComponents';
import { Button } from 'react-bootstrap';

interface Props {
    droppableObjName: string;
    droppableId: string;
    items: ListTodoItem[];
}

const DroppableSectionWrapper = ({ droppableObjName, droppableId, items = [] }: Props) => {
    const handleAddDragItemEvent = (event: React.MouseEvent<HTMLButtonElement>) => {
    };

    return (
        <OutsideSectionWrapper>
            <StyledDroppable droppableId={droppableId}>
                {(provided, snapshot) => (
                    <DroppableContainer ref={provided.innerRef} {...provided.droppableProps}>
                        <DragItemHeader>{droppableObjName}</DragItemHeader>
                        {items.map((item, index) => (
                            <DrapCard item={item} index={index} key={`drap_card_${item._id}`} />
                        ))}
                        {provided.placeholder}
                        {/* <Button
                            type="button"
                            size="sm"
                            style={{
                                borderRadius: '25px',
                                backgroundColor: 'red',
                                padding: '8px',
                                textAlign: 'right',
                            }}
                        >
                            test
                        </Button> */}
                        <Button id="test2" variant="danger" size="sm" onClick={handleAddDragItemEvent}>
                            Block level button
                        </Button>
                    </DroppableContainer>
                )}
            </StyledDroppable>
        </OutsideSectionWrapper>
    );
};

export default DroppableSectionWrapper;
