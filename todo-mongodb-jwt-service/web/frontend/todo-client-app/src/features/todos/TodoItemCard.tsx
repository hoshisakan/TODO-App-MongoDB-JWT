import { useStore } from '../../app/stores/store';
import { TodoFormValuesAddCard } from '../../app/models/Todo';
import { toast } from 'react-toastify';

const TodoItemCard = () => {
    const { todoCategoryStore, todoStore } = useStore();
    const { todoCategories } = todoCategoryStore;
    const { addTodo } = todoStore;
    // const [selectedStatusOption, setSelectedStatusOption] = useState('default');
    // const [selectedCategoryOption, setSelectedCategoryOption] = useState('default');

    // const handleStatusSelectEvent = (event: ChangeEvent<HTMLSelectElement>) => {
    //     // const selectedValue = document.querySelector<HTMLSelectElement>('select[id="status"]')?.value;
    //     // alert(event.target.value);
    //     // alert(selectedValue);
    //     // console.log(`Get selected value: ${selectedValue}`);
    //     setSelectedStatusOption(event.target.value);
    // };

    // const handleCategorySelectEvent = (event: ChangeEvent<HTMLSelectElement>) => {
    //     // const selectedValue = document.querySelector<HTMLSelectElement>('select[id="todoCategoryId"]')?.value;
    //     // alert(event.target.value);
    //     // alert(selectedValue);
    //     // console.log(`Get selected value: ${selectedValue}`);
    //     setSelectedCategoryOption(event.target.value);
    // };

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        let requestValues: TodoFormValuesAddCard = {
            title: '',
            description: '',
            status: '',
            startDate: '',
            dueDate: '',
            todoCategoryId: '',
        };
        let formSelectFieldNames = ['status', 'todoCategoryId'];
        let formInputFieldNames = ['title', 'description', 'status', 'startDate', 'dueDate', 'todoCategoryId'];
        // let formInputFieldNames = ['title', 'description', 'startDate', 'dueDate', 'todoCategoryId'];
        let isAllowSubmit = true;

        formInputFieldNames.forEach((fieldName, index) => {
            if (formSelectFieldNames.includes(fieldName)) {
                requestValues[fieldName as keyof TodoFormValuesAddCard] =
                    document.querySelector<HTMLSelectElement>(`select[id="${fieldName}"]`)?.value ?? '';
            } else {
                requestValues[fieldName as keyof TodoFormValuesAddCard] =
                    document.querySelector<HTMLInputElement>(`input[name="${fieldName}"]`)?.value ?? '';
            }
            if (fieldName !== 'description' && !requestValues[fieldName as keyof TodoFormValuesAddCard]) {
                alert(`The field ${fieldName} can't be empty !`);
                isAllowSubmit = false;
                return;
            }
        });

        if (isAllowSubmit) {
            console.log(`Add card requestValues: ${JSON.stringify(requestValues)}`);
            toast.success(`Add card requestValues: ${JSON.stringify(requestValues)}`);
            addTodo(requestValues)
                .then((response: any) => {
                })
                .catch((err: any) => {
                    toast.error(`Error: ${err.statck}`);
                });
        }
    };

    return (
        <div className="container-fluid">
            <div className="row d-flex justify-content-center p-5">
                <form onSubmit={handleSubmit}>
                    <div className="col-12">
                        <label className="form-label">
                            標題 <span className="text-danger">*</span>
                        </label>
                        <input
                            type="text"
                            className="form-control"
                            name="title"
                            id="title"
                            // value=""
                            required
                        />
                    </div>
                    <div className="col-12">
                        <label className="form-label">描述</label>
                        <input
                            type="text"
                            className="form-control"
                            name="description"
                            id="description"
                            // value=""
                        />
                    </div>
                    <div className="col-12">
                        <label className="form-label">
                            狀態 <span className="text-danger">*</span>
                        </label>
                        <select
                            // defaultValue={'DEFAULT'}
                            id="status"
                            className="form-select"
                            // onChange={handleStatusSelectEvent}
                            // value={selectedStatusOption}
                        >
                            <option value="DEFAULT" disabled>
                                請選擇狀態
                            </option>
                            <option value="pending">待執行</option>
                            <option value="ongoing">進行中</option>
                            <option value="completed">已完成</option>
                        </select>
                    </div>
                    <div className="col-12">
                        <label className="form-label">
                            開始日 <span className="text-danger">*</span>
                        </label>
                        <input
                            type="date"
                            className="form-control"
                            name="startDate"
                            id="startDate"
                            // value=""
                            required
                        />
                    </div>
                    <div className="col-12">
                        <label className="form-label">
                            逾期日 <span className="text-danger">*</span>
                        </label>
                        <input
                            type="date"
                            className="form-control"
                            name="dueDate"
                            id="dueDate"
                            // value=""
                            required
                        />
                    </div>
                    <div className="col-12">
                        <label className="form-label">
                            類別 <span className="text-danger">*</span>
                        </label>
                        <select
                            // defaultValue={'DEFAULT'}
                            id="todoCategoryId"
                            name="todoCategoryId"
                            className="form-select"
                            // onChange={handleCategorySelectEvent}
                            // value={selectedCategoryOption}
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
                    <div className="col-12 p-2 text-end d-grid gap-2">
                        <button type="submit" className="btn btn-primary ">
                            Add
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default TodoItemCard;
