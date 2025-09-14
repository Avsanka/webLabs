const addSubDetailsBtn = document.getElementById('detailsAddSubTaskBtn');
const saveDetailsBtn = document.getElementById('saveDetailsBtn');
const modalDetails = document.getElementById('myModal2');
const cancelDetailsBtn = document.getElementById('cancelDetailsBtn');

document.addEventListener('DOMContentLoaded', function() {
    const subContainer = document.getElementById('subtasksDetails');


    cancelDetailsBtn.addEventListener('click', function() {
        modalDetails.style.display = 'none';
    });

    window.addEventListener('click', function(event) {
            if (event.target === modalDetails) {
                modalDetails.style.display = 'none';
            }
        });

    addSubDetailsBtn.addEventListener('click', function(){
        addSubDetailsBtn.disabled = true;
        addSubDetailsBtn.style.display = 'none';
        saveDetailsBtn.disabled = true;
        const newSub = document.createElement('div');

        newSub.innerHTML=`
            <input class='subtask-input form-control'>
            <button class='btn btn-success' onclick='addNewSub()'>✓</button>
        `
        newSub.className = 'subtask-item';

        subContainer.appendChild(newSub);
        const newInput = subContainer.lastElementChild.querySelector('input')
        newInput.focus();

        newInput.addEventListener('keydown', function(event) {
            if (event.key === 'Escape') {
                event.preventDefault();
                subContainer.removeChild(newSub);
                addSubDetailsBtn.disabled = false;
                addSubDetailsBtn.style.display = 'block';
                saveDetailsBtn.disabled = false;
            }
        });

    });




    saveDetailsBtn.addEventListener('click', function(){
        data = getData();
        if(data){
            addSubDetailsBtn.disabled = true;
            saveDetailsBtn.disabled = true;
            cancelDetailsBtn.disabled = true;
            saveData(data);
        }
    });



    function getData()
    {
        const name = document.getElementById('noteLabelInput').value.trim();
        const pInput = document.getElementById('detailsPriority');
        if (!name) {
            alert('Пожалуйста, введите название');
            return;
        }

        const priority = pInput.options[pInput.selectedIndex].text;

        const subtaskInputs = document.querySelectorAll('.form-check-input');
        const subtaskNames = document.querySelectorAll('.subName');
        const subTasks = [];
        let counter = 0;

        subtaskInputs.forEach(input => {
            subTasks.push([subtaskNames[counter].innerHTML, input.checked ? 1 : 0]);
            counter++;
        });
        return [name, priority, subTasks];
    }

    function saveData(newData)
    {

        const id = document.getElementById('myModal2').getAttribute('data-id')
        $.ajax({
            type: 'POST',
            url: '/editNote/' + id,
            data: JSON.stringify(newData),
            success: function()
            {
                modalDetails.style.display = 'none';
                const row = document.querySelector(`tr[data-id = "${id}"]`);
                row.firstElementChild.innerHTML = newData[0];
                row.lastElementChild.innerHTML = newData[1];

            }
        });
    }


})

function addNewSub()
{
    const subContainer = document.getElementById('subtasksDetails');
    const value = subContainer.lastElementChild.querySelector('input').value.trim();
    if(!value){
        alert('Введите название!')
        return;
    }
    const task = document.createElement('div');
    task.innerHTML= `
        <input class="form-check-input" type="checkbox" value="">
        <h6 class="subName" style="margin-left: 5px">${value}</h6>
    `
    task.style.display = 'flex';
    subContainer.lastElementChild.remove();

    task.lastElementChild.addEventListener('dblclick', function(){
        const divToRemove = this.closest('div');
        if (divToRemove) {
            divToRemove.remove();
        };
    });
    subContainer.appendChild(task);
    addSubDetailsBtn.disabled = false;
    addSubDetailsBtn.style.display = 'block';
    saveDetailsBtn.disabled = false;
}


function showDetails(note)
{
    const modalDetails = document.getElementById('myModal2');
    const label = document.getElementById('noteLabel');
    const labelInput = document.getElementById('noteLabelInput');
    const noteName = document.getElementById('noteName');
    const select = document.getElementById('detailsPriority');
    const subContainer = document.getElementById('subtasksDetails');

    subContainer.innerHTML = '';
    label.style.display = 'block';
    labelInput.style.display = 'none';
    addSubDetailsBtn.disabled = true;
    addSubDetailsBtn.style.display = 'none';
    saveDetailsBtn.disabled = true;
    cancelDetailsBtn.disabled = false;

    labelInput.value = note.firstElementChild.innerHTML;

    label.addEventListener('dblclick', function(){
        label.style.display = 'none';
        labelInput.style.display = 'block';
    });

    modalDetails.style.display = 'block';
    label.innerHTML = note.firstElementChild.innerHTML;


    const optionToSelect = Array.from(select.options).find(option => option.text === note.lastElementChild.innerHTML);
    optionToSelect.selected = true;

    modalDetails.setAttribute('data-id', note.getAttribute('data-id'));
    loadSubtasks(note.getAttribute('data-id'));
}

function loadSubtasks(id)
{
     $.ajax({
            type: 'GET',
            url: '/getSubtasks/' + id,
            success: function(answer)
            {
                const subContainer = document.getElementById('subtasksDetails');
                if(answer != 'empty')
                {
                    answer.forEach((item) =>
                    {
                        const task = document.createElement('div');
                        let checkFlag='';
                        if (item.Done == 1){
                            checkFlag = 'checked';
                        }

                        task.innerHTML= `
                            <input class="form-check-input" type="checkbox" value="" ${checkFlag}>
                            <h6 class="subName" style="margin-left: 5px">${item.Content}</h6>
                        `
                        task.style.display = 'flex';
                        subContainer.appendChild(task);
                    });

                    const headers = document.querySelectorAll('.subName');

                    headers.forEach(element => {
                        element.addEventListener('dblclick', function(){
                            const divToRemove = this.closest('div');
                            if (divToRemove) {
                                divToRemove.remove();
                            };
                        });
                    });

                }
                addSubDetailsBtn.disabled = false;
                addSubDetailsBtn.style.display = 'block';
                saveDetailsBtn.disabled = false;
            }
        });
}