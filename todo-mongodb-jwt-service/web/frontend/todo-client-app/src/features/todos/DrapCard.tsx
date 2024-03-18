import { Draggable } from 'react-beautiful-dnd';
import { Todo } from '../../app/models/Todo';
import { DragCardItemEditOrRemoveButton, DragItem, DragItemContent, StyledIcon } from './styles/StyledComponents';
import { RefObject } from 'react';
import { Modal as BootstrapModal } from 'bootstrap';
import { useStore } from '../../app/stores/store';
import { observer } from 'mobx-react-lite';

interface Props {
    item: Todo;
    index: number;
    bsModalRef: RefObject<InstanceType<typeof BootstrapModal> | null>;
}

const DrapCard = observer(({ item, index, bsModalRef }: Props) => {
    const { todoStore } = useStore();
    const { setEditedTodoId, setRemovedTodoId, detailTodo } = todoStore;

    const showEditModal = (editId: string) => {
        setEditedTodoId(editId);
        detailTodo(editId).catch((err: any) => {
            console.log(`Error: ${JSON.stringify(err)}`);
        });
        bsModalRef.current?.show();
    };

    const showRemoveModal = (removeId: string) => {
        setRemovedTodoId(removeId);
        bsModalRef.current?.show();
    };

    return (
        <Draggable key={item._id} draggableId={item._id} index={index}>
            {(provided, snapshot) => {
                return (
                    <DragItem
                        id={`drag_${item._id}_item`}
                        ref={provided.innerRef}
                        // snapshot={snapshot}
                        // isDragging={snapshot.isDragging}
                        // draggableStyle={provided.draggableProps.style}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                    >
                        <DragItemContent>
                            <div className="row">
                                <div className="col-8"> {item.title}</div>
                                <div className="col-4">
                                    <DragCardItemEditOrRemoveButton
                                        id={`edit_${item._id}_btn`}
                                        type="button"
                                        data-bs-toggle="modal"
                                        data-bs-target="#editStaticBackdrop"
                                        onClick={() => showEditModal(item._id)}
                                    >
                                        <StyledIcon className="bi bi-pencil h6"></StyledIcon>
                                    </DragCardItemEditOrRemoveButton>
                                    <DragCardItemEditOrRemoveButton
                                        id={`remove_${item._id}_btn`}
                                        type="button"
                                        data-bs-toggle="modal"
                                        data-bs-target="#removeStaticBackdrop"
                                        onClick={() => showRemoveModal(item._id)}
                                    >
                                        <StyledIcon className="bi bi-trash h6"></StyledIcon>
                                    </DragCardItemEditOrRemoveButton>
                                </div>
                            </div>
                        </DragItemContent>
                    </DragItem>
                );
            }}
        </Draggable>
    );
});

export default DrapCard;
