import { useCallback, useEffect, useRef } from 'react';
import { Modal as BootstrapModal } from 'bootstrap';
import { useStore } from '../../app/stores/store';
import { observer } from 'mobx-react-lite';
import { MouseEvent } from 'react';
import { toast } from 'react-toastify';

const RemoveTodoConfirm = observer(() => {
    const modalRef = useRef<HTMLDivElement | null>(null);
    const bsModalRef = useRef<InstanceType<typeof BootstrapModal> | null>(null);
    const { todoStore } = useStore();
    const { isRemovedSuccess, setIsRemovedSuccess, removedTodoCardId, removeTodo } = todoStore;

    const hideModal = useCallback(() => {
        bsModalRef.current?.hide();
    }, []);

    const handleRemoveItem = (event: MouseEvent<HTMLButtonElement>) => {
        const removeId = (event.target as HTMLButtonElement).id;
        console.log(`Current remove id: ${removeId}`);
        removeTodo(removeId)
            .then((response: any) => {
                toast.success(`Remove ${removeId} successfully.`);
            })
            .catch((err: any) => {
                // toast.error(`Error: ${err.statck}`);
            });
    };

    useEffect(() => {
        if (isRemovedSuccess) {
            hideModal();
            setIsRemovedSuccess(false);
        } else {
            if (modalRef.current) {
                if (!bsModalRef.current) {
                    bsModalRef.current = new BootstrapModal(modalRef.current, {
                        backdrop: 'static',
                        keyboard: false,
                    });
                }
            }
        }
    }, [hideModal, isRemovedSuccess, setIsRemovedSuccess]);

    return (
        <div
            className="modal fade"
            id="removeStaticBackdrop"
            data-bs-backdrop="static"
            // data-bs-keyboard="false"
            aria-labelledby="removeStaticBackdropLabel"
            aria-hidden="true"
            ref={modalRef}
        >
            <div className="modal-dialog">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title" id="removeStaticBackdrop">
                            {/* Remove Todo {removedTodoCardId} Item */}
                            Remove Todo Item
                        </h5>
                        <button type="button" className="btn-close" onClick={hideModal} aria-label="Close"></button>
                    </div>
                    <div className="modal-body">
                        <p>請問是否移除 {removedTodoCardId} 的項目?</p>
                    </div>
                    <div className="modal-footer">
                        <button
                            type="button"
                            id={`${removedTodoCardId}`}
                            className="btn btn-primary"
                            onClick={handleRemoveItem}
                        >
                            Remove
                        </button>
                        <button type="button" className="btn btn-danger" data-bs-dismiss="modal">
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
});

export default RemoveTodoConfirm;
