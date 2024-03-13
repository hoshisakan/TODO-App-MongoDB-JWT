import { useCallback, useEffect, useRef } from 'react';
import { Modal as BootstrapModal } from 'bootstrap';
import EditTodoItem from './EditTodoItem';
import { useStore } from '../../app/stores/store';
import { observer } from 'mobx-react-lite';

const EditTodo = observer(() => {
    const modalRef = useRef<HTMLDivElement | null>(null);
    const bsModalRef = useRef<InstanceType<typeof BootstrapModal> | null>(null);
    const { todoStore } = useStore();
    const {
        isEditedSuccess,
        setIsEditedSuccess,
        editedTodoId,
        detailTodo,
        // setTodoDetail
    } = todoStore;

    const hideModal = useCallback(() => {
        // setTodoDetail({
        //     _id: '',
        //     title: '',
        //     description: null,
        //     status: '',
        //     startDate: '',
        //     dueDate: '',
        //     user: '',
        //     createdAt: '',
        //     updatedAt: null,
        //     todoCategoryId: ''
        // });
        bsModalRef.current?.hide();
    }, []);

    useEffect(() => {
        if (isEditedSuccess) {
            hideModal();
            setIsEditedSuccess(false);
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
    }, [detailTodo, editedTodoId, hideModal, isEditedSuccess, setIsEditedSuccess]);

    return (
        <div
            className="modal fade"
            id="editStaticBackdrop"
            data-bs-backdrop="static"
            data-bs-keyboard="false"
            aria-labelledby="editStaticBackdropLabel"
            aria-hidden="true"
            ref={modalRef}
        >
            <div className="modal-dialog">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title" id="editStaticBackdrop">
                            Edit Todo {editedTodoId} Item
                        </h5>
                        <button type="button" className="btn-close" onClick={hideModal} aria-label="Close"></button>
                    </div>
                    <div className="modal-body">
                        <EditTodoItem />
                    </div>
                </div>
            </div>
        </div>
    );
});

export default EditTodo;
