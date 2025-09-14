document.addEventListener('DOMContentLoaded', function() {
    const addRowBtn = document.getElementById('addRowBtn');
    const modal = document.getElementById('myModal');
    const nameInput = document.getElementById('nameInput');
    const priorityInput = document.getElementById('priorityInput')
    const saveBtn = document.getElementById('saveBtn');
    const cancelBtn = document.getElementById('cancelBtn');
    const addSubtaskBtn = document.getElementById('addSubtaskBtn');
    const subtasksList = document.getElementById('subtasksList');
    const tableBody = document.querySelector('#myTable tbody');


    loadData();

    let subtaskCounter = 0;

    addRowBtn.addEventListener('click', function() {
        modal.style.display = 'block';
        nameInput.value = '';
        priorityInput.value = 1;
        subtasksList.innerHTML = '';
        subtaskCounter = 0;
        nameInput.focus();
        saveBtn.disabled = false;
        cancelBtn.disabled = false;
        addSubtaskBtn.disabled = false;
    });

    cancelBtn.addEventListener('click', function() {
        modal.style.display = 'none';
    });


    addSubtaskBtn.addEventListener('click', addSubtaskInput);

    function addSubtaskInput() {
        subtaskCounter++;
        const subtaskId = `subtask-${subtaskCounter}`;

        const subtaskItem = document.createElement('div');
        subtaskItem.className = 'subtask-item';
        subtaskItem.innerHTML = `
            <input type="text"
                   class="subtask-input form-control"
                   id="${subtaskId}"
                   placeholder="Введите название подзадачи"
                   data-id="${subtaskCounter}">
            <button type="button" class="btn btn-danger" onclick="removeSubtask(${subtaskCounter})">×</button>
        `;

        subtasksList.appendChild(subtaskItem);

        document.getElementById(subtaskId).focus();

        document.getElementById(subtaskId).addEventListener('keypress', function(event) {
            if (event.key === 'Enter') {
                event.preventDefault();
                addSubtaskInput();
            }
        });
    }

      window.removeSubtask = function(subtaskId) {
        const subtaskElement = document.querySelector(`.subtask-input[data-id="${subtaskId}"]`);
        if (subtaskElement) {
            subtaskElement.parentElement.remove();
        }
    }

     function collectSubtasks() {
        const subtaskInputs = document.querySelectorAll('.subtask-input');
        const subtasks = [];

        subtaskInputs.forEach(input => {
            const value = input.value.trim();
            if (value) {
                subtasks.push(value);
            }
        });

        return subtasks;
    }

    window.addEventListener('click', function(event) {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });

    saveBtn.addEventListener('click', saveRow);

    function saveRow() {
        const name = nameInput.value.trim();
        const subtasks = collectSubtasks();

        if (!name) {
            alert('Пожалуйста, введите название');
            return;
        }

        const currentDate = new Date().toLocaleDateString();
        const priority = priorityInput.options[priorityInput.selectedIndex].text;
        saveToDB(name, subtasks, currentDate, priority);

    }



    function saveToDB(name, subtasks, currentDate, priority)
    {
        const newNote = [name, subtasks, currentDate, priority];

        saveBtn.disabled = true;
        cancelBtn.disabled = true;
        addSubtaskBtn.disabled = true;


         $.ajax({
            type: 'POST',
            url: '/addNote',
            data: JSON.stringify(newNote),

            success: function(answer)
            {
                const newRow = document.createElement('tr');
                newRow.innerHTML = `
                <td>${name}</td>
                <td>${currentDate}</td>
                <td>${priority}</td>
                `;
                newRow.setAttribute('data-id', parseInt(answer));
                tableBody.appendChild(newRow);


                newRow.addEventListener('click', function() {
                    showDetails(this);
                });


                modal.style.display = 'none';
            }
        });
    }

    function loadData()
    {
        $.ajax({
            type: 'GET',
            url: '/getNotes',
            success: function(answer)
            {
                answer.forEach((item) =>
                {
                    const newRow = document.createElement('tr');
                    newRow.innerHTML = `
                    <td>${item.Name}</td>
                    <td>${item.Date}</td>
                    <td>${item.Priority}</td>
                    `;
                    newRow.setAttribute('data-id', item.Note_ID);

                    newRow.addEventListener('click', function() {
                        showDetails(this);
                    });

                    tableBody.appendChild(newRow);
                })
            }
        });
    }

});





