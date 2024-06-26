import { useStore } from '../../app/stores/store';
import { TodoFormValuesAddOrEdit } from '../../app/models/Todo';
// import { toast } from 'react-toastify';
import { observer } from 'mobx-react-lite';
import { ChangeEvent, useEffect, useState } from 'react';
import { toast } from 'react-toastify';

const EditTodoItem = observer(() => {
    const { todoStatusStore, todoCategoryStore, todoStore } = useStore();
    const { todoCategories } = todoCategoryStore;
    const { todoStatuses } = todoStatusStore;
    const { editDetail, editedTodoId, editTodo } = todoStore;
    const [state, setState] = useState<TodoFormValuesAddOrEdit>({
        title: '',
        description: '',
        startDate: '',
        dueDate: '',
        todoCategoryId: '',
        todoStatusId: '',
    });

    const handleChange = (e: ChangeEvent<HTMLTextAreaElement | HTMLInputElement | HTMLSelectElement>) => {
        const name = e.target.name;
        const value = e.target.value;

        // setState((prevState) => {
        //     // Object.assign would also work
        //     return { ...prevState, [name]: value };
        // });

        setState((prevValue) => ({
            ...prevValue,
            [name]: value,
        }));

        ///TODO: 因為 setState是非同步的方法，故會有延遲的現象發生，非即時更新，但若在 Form 提交時，所有值皆會被更新至 state 中
        // console.log(`result: ${JSON.stringify(state)}`);
        // toast.info(`result: ${JSON.stringify(state)}`);
    };

    const clearFormValues = () => {
        setState({
            title: '',
            description: '',
            startDate: '',
            dueDate: '',
            todoCategoryId: '',
            todoStatusId: '',
        });
        // toast.info('Clear form values process completed.');
    };

    const checkFormEmptyExists = (checkValues: TodoFormValuesAddOrEdit) => {
        let result = false;
        Object.entries(checkValues).forEach(([key, value]) => {
            if (key !== 'description' && !value) {
                result = true;
            }
        });
        return result;
    };

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const requestValues: TodoFormValuesAddOrEdit = state;
        console.log(`requestValues: ${JSON.stringify(requestValues)}`);
        // toast.info(`requestValues: ${JSON.stringify(requestValues)}`);
        const isEmptyExists = checkFormEmptyExists(requestValues);

        if (!isEmptyExists) {
            // toast.success('OK, will be submit form to backend server');
            editTodo(editedTodoId, requestValues)
                .then((response: any) => {
                    clearFormValues();
                    toast.success('Add successfully.');
                })
                .catch((err: any) => {
                    toast.error(`Error: ${err.statck}`);
                });
        } else {
            toast.error('Find empty value in form values.');
            return;
        }
        return;
    };

    useEffect(() => {
        if (editDetail._id) {
            // console.log(`todoCategoryId: ${editDetail.todoCategoryId}`);
            // console.log(`todoStatusId: ${editDetail.todoStatusId}`);
            setState({
                title: editDetail.title,
                description: editDetail.description,
                startDate: editDetail.startDate,
                dueDate: editDetail.dueDate,
                todoCategoryId: editDetail.todoCategoryId,
                todoStatusId: editDetail.todoStatusId,
            });
        }
    }, [editDetail]);

    return (
        // <div className="container-fluid">
        //     <div className="row d-flex justify-content-center p-5">
        //     </div>
        // </div>
        <form onSubmit={handleSubmit}>
            <div className="mb-3">
                <label className="form-label">
                    標題 <span className="text-danger">*</span>
                </label>
                <input
                    type="text"
                    className="form-control"
                    name="title"
                    id="title"
                    value={state.title}
                    onChange={handleChange}
                    required
                />
            </div>
            <div className="mb-3">
                <label className="form-label">描述</label>
                <textarea
                    className="form-control"
                    name="description"
                    id="description"
                    value={state.description ?? ''}
                    onChange={handleChange}
                />
            </div>
            <div className="mb-3">
                <label className="form-label">
                    狀態 <span className="text-danger">*</span>
                </label>
                <select
                    // defaultValue={'DEFAULT'}
                    id="todoStatusId"
                    name="todoStatusId"
                    className="form-select"
                    value={!state.todoStatusId ? 'DEFAULT' : state.todoStatusId}
                    onChange={handleChange}
                >
                    <option value="DEFAULT" disabled>
                        請選擇狀態
                    </option>
                    {todoStatuses.map((item) => (
                        <option id={item.name} key={item.name} value={item.value.toString()}>
                            {item.name}
                        </option>
                    ))}
                </select>
            </div>
            <div className="mb-3">
                <label className="form-label">
                    開始日 <span className="text-danger">*</span>
                </label>
                <input
                    type="datetime-local"
                    className="form-control"
                    name="startDate"
                    id="startDate"
                    value={state.startDate}
                    onChange={handleChange}
                    required
                />
            </div>
            <div className="mb-3">
                <label className="form-label">
                    逾期日 <span className="text-danger">*</span>
                </label>
                <input
                    type="datetime-local"
                    className="form-control"
                    name="dueDate"
                    id="dueDate"
                    value={state.dueDate}
                    onChange={handleChange}
                    required
                />
            </div>
            <div className="mb-3">
                <label className="form-label">
                    類別 <span className="text-danger">*</span>
                </label>
                <select
                    // defaultValue={'DEFAULT'}
                    id="todoCategoryId"
                    name="todoCategoryId"
                    className="form-select"
                    value={!state.todoCategoryId ? 'DEFAULT' : state.todoCategoryId}
                    onChange={handleChange}
                >
                    <option value="DEFAULT" disabled>
                        請選擇類別
                    </option>
                    {todoCategories.map((item) => (
                        <option id={item.name} key={item.name} value={item.value.toString()}>
                            {item.name}
                        </option>
                    ))}
                </select>
            </div>
            <div className="mb-3 d-grid gap-2">
                <button type="submit" className="btn btn-primary">
                    Update
                </button>
            </div>
        </form>
    );
});

export default EditTodoItem;
