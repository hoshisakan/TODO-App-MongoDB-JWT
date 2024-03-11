import { useCallback, useEffect, useRef } from 'react';
import { Modal as BootstrapModal } from 'bootstrap';
import TodoItemCard from './TodoItemCard';
import { useStore } from '../../app/stores/store';


const AddTodoItem = () => {
    const modalRef = useRef<HTMLDivElement | null>(null);
    const bsModalRef = useRef<InstanceType<typeof BootstrapModal> | null>(null);
    const { todoStore } = useStore();
    const { isAddedSuccess, setIsAddeedSuccess } = todoStore;

    const hideModal = useCallback(() => {
        bsModalRef.current?.hide();
    }, []);

    useEffect(() => {
        if (isAddedSuccess) {
            hideModal();
            setIsAddeedSuccess(false);
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
    }, [hideModal, isAddedSuccess, setIsAddeedSuccess]);

    return (
        <>
            <div
                className="modal fade"
                id="staticBackdrop"
                data-bs-backdrop="static"
                data-bs-keyboard="false"
                aria-labelledby="staticBackdropLabel"
                aria-hidden="true"
                ref={modalRef}
            >
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title" id="staticBackdropLabel">
                                Add Todo Item
                            </h5>
                            <button type="button" className="btn-close" onClick={hideModal} aria-label="Close"></button>
                        </div>
                        <div className="modal-body">
                            <TodoItemCard />
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default AddTodoItem;
