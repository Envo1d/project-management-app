let modal = document.getElementById("modal");
let modalInput = document.getElementById("modal-input");
let modalBtn = document.getElementById("modal-btn");

function openListModal() {
    modal.style.display = "block";
    modalInput.placeholder = "Введіть назву списку";
    modalBtn.onclick = addList;
}

function openTaskModal(listId) {
    modal.style.display = "block";
    modalInput.placeholder = "Введіть назву завдання";
    modalBtn.onclick = function () {
        addTask(listId);
    };
}

function addList() {
    let listName = modalInput.value.trim();
    if (listName) {
        let newList = document.createElement("div");
        newList.className = "list";
        newList.id = "list-" + Date.now();
        newList.innerHTML = `
            <div class="list-header">
                <span>${listName}</span>
                <button class="delete-list-btn" onclick="deleteList('${newList.id}')">X</button>
            </div>
            <div class="add-task" onclick="openTaskModal('${newList.id}')">+ Додати завдання</div>
        `;
        document.getElementById("board").insertBefore(newList, document.querySelector(".add-list"));
        closeModal();
    }
}

function addTask(listId) {
    let taskName = modalInput.value.trim();
    if (taskName) {
        let newTask = document.createElement("div");
        newTask.className = "task";
        newTask.draggable = true;
        newTask.ondragstart = dragStart;
        newTask.innerText = taskName;
        document.getElementById(listId).insertBefore(newTask, document.querySelector(".add-task"));
        closeModal();
    }
}

function deleteList(listId) {
    let list = document.getElementById(listId);
    if (list) {
        list.remove();
    }
}

function closeModal() {
    modal.style.display = "none";
    modalInput.value = "";
}

function dragStart(e) {
    e.dataTransfer.setData("text/plain", e.target.innerText);
}

document.addEventListener("dragover", function (e) {
    e.preventDefault();
});

document.addEventListener("drop", function (e) {
    e.preventDefault();
    let taskName = e.dataTransfer.getData("text/plain");
    let targetElement = document.elementFromPoint(e.clientX, e.clientY);

    if (targetElement.className === "task") {
        let newTask = document.createElement("div");
        newTask.className = "task";
        newTask.draggable = true;
        newTask.ondragstart = dragStart;
        newTask.innerText = taskName;
        targetElement.parentElement.insertBefore(newTask, targetElement);
    }
});
