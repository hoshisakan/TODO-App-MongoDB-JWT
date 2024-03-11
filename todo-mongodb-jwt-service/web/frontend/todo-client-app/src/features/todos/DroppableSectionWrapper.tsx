import DrapCard from './DrapCard';
import { Todo } from '../../app/models/Todo';
import {
    // DragCardItemAddButton,
    DragItemHeader,
    DroppableContainer,
    OutsideSectionWrapper,
    StyledDroppable,
} from './styles/StyledComponents';
import { observer } from 'mobx-react-lite';
// import { useRef } from 'react';
// import { Modal as BootstrapModal } from 'bootstrap';

interface Props {
    droppableObjName: string;
    droppableId: string;
    items: Todo[];
}


const DroppableSectionWrapper = ({ droppableObjName, droppableId, items = [] }: Props) => {
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
                    </DroppableContainer>
                )}
            </StyledDroppable>
        </OutsideSectionWrapper>
    );
};

export default observer(DroppableSectionWrapper);
