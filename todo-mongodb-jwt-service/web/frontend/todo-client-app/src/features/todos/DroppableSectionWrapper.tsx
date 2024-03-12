import DrapCard from './DrapCard';
import { Todo } from '../../app/models/Todo';
import {
    DragItemHeader,
    DroppableContainer,
    OutsideSectionWrapper,
    StyledDroppable,
} from './styles/StyledComponents';
import { observer } from 'mobx-react-lite';
import { useRef } from 'react';
import { Modal as BootstrapModal } from 'bootstrap';
import EditTodo from './EditTodo';
import RemoveTodoConfirm from './RemoveTodoConfirm';

interface Props {
    droppableObjName: string;
    droppableId: string;
    items: Todo[];
}

const DroppableSectionWrapper = ({ droppableObjName, droppableId, items = [] }: Props) => {
    const bsModalRef = useRef<InstanceType<typeof BootstrapModal> | null>(null);

    return (
        <OutsideSectionWrapper>
            <EditTodo />
            <RemoveTodoConfirm />
            <StyledDroppable droppableId={droppableId}>
                {(provided, snapshot) => (
                    <DroppableContainer
                        id={`droppable_${droppableId}_container`}
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                    >
                        <DragItemHeader>{droppableObjName}</DragItemHeader>
                        {items.map((item, index) => (
                            <DrapCard
                                item={item}
                                index={index}
                                key={`drap_${item._id}_card`}
                                bsModalRef={bsModalRef}
                            />
                        ))}
                        {provided.placeholder}
                    </DroppableContainer>
                )}
            </StyledDroppable>
        </OutsideSectionWrapper>
    );
};

export default observer(DroppableSectionWrapper);
