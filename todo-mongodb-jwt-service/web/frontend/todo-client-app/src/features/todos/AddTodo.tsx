import { useCallback, useEffect, useRef } from 'react';
import { Modal as BootstrapModal } from 'bootstrap';
import AddTodoItem from './AddTodoItem';
import { useStore } from '../../app/stores/store';
import { observer } from 'mobx-react-lite';

const AddTodo = observer(() => {
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
        <div
            className="modal fade"
            id="addStaticBackdrop"
            data-bs-backdrop="static"
            data-bs-keyboard="false"
            aria-labelledby="addStaticBackdropLabel"
            aria-hidden="true"
            ref={modalRef}
        >
            <div className="modal-dialog">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title" id="addStaticBackdropLabel">
                            Add Todo Item
                        </h5>
                        <button type="button" className="btn-close" onClick={hideModal} aria-label="Close"></button>
                    </div>
                    <div className="modal-body">
                        <AddTodoItem />
                    </div>
                </div>
            </div>
        </div>
    );
});

export default AddTodo;
