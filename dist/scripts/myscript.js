// My javascript used for a todo-list

// Declaring global variabels and constants
let todoList = []; 
const inputField = document.getElementsByClassName('todo-container__task-input');
const addButton = document.getElementsByClassName('todo-container__add-button');
const listShown = document.getElementsByClassName('todo-container__todo-list');
const readyItems = document.getElementsByClassName('todo-container__completed-items');
const taskAlreadyExist = document.getElementsByClassName('todo-container__warning-message');

console.log(inputField);

let readyItemCounter = 0;

// ##################################################################################################
// #################### Functions to work with local storage ########################################

// Function to save task to local storage
const saveToLocal = (itemToSave, index = (todoList.length - 1)) => {
    localStorage.setItem(`task${index}`, JSON.stringify(itemToSave));
}

// Function to update tasks in local storage
const updateLocalDone = (itemNr, state) => {
    let itemTochange = JSON.parse(localStorage.getItem(`task${itemNr}`));
    let itemToLoadBack = {todo: itemTochange.todo, done: state};
    localStorage.setItem(`task${itemNr}`, JSON.stringify(itemToLoadBack));
    todoList = getFromLocal();
}   

// Function to get tasks from local storage and see to it that they are sorted correct
const getFromLocal = () => { 
    let indexCounter = 0;
    let  savedTaskArray = [];
    let maxArray = [];
    while (indexCounter < localStorage.length) {
        let storageKey = localStorage.key(indexCounter);
        let retrievedObject = JSON.parse(localStorage.getItem(storageKey));
        let newObject = {task: storageKey.at(-1), todo: retrievedObject.todo, done: retrievedObject.done};
        savedTaskArray[indexCounter] = newObject;
        maxArray.push(storageKey.at(-1));
        indexCounter++;
    }
    let comparer = maxArray.sort().at(-1);
    let outputArray = [];
    indexCounter = 0;
    while (indexCounter < comparer + 1) {
        savedTaskArray.forEach(item => {
            if (item.task == indexCounter) {
                outputArray.push({todo: item.todo, done: item.done});
            }
        });
        indexCounter++;
    }
    localStorage.clear();
    indexCounter = 0;
    while (indexCounter < outputArray.length) {
        saveToLocal(outputArray[indexCounter], indexCounter);
        indexCounter++;
    }
    return outputArray;
}

// ##################################################################################################
// ###################### Functions to manipulate the DOM ###########################################

// Function to add ONE row of the tasklist to the DOM 
const addRowToHTML = (taskItem) => {
            const itemAdd = document.createElement('li');
            const itemText = document.createElement('span');
            const trashCan = document.createElement('span');

            trashCan.innerHTML = '&#x1F5D1;';
            trashCan.setAttribute('class', 'todo-container__delete');
            trashCan.addEventListener('click', removeTask);

            itemText.textContent = taskItem.todo;
            if(taskItem.done){
                itemText.classList.add('todo-container__todo-item-content--item-done');
            }
            itemText.classList.add('todo-container__todo-item-content');
            itemText.addEventListener('click', changeTask);
            itemText.addEventListener('dblclick', removeTask);

            itemAdd.classList.add('todo-container__todo-item');
            itemAdd.appendChild(itemText);
            itemAdd.appendChild(trashCan);

            listShown[0].appendChild(itemAdd);
}

// Update the visible readycounter in page
const updateReady = (readyCount) => {    
    if (readyCount > 0) {
        readyItems[0].textContent = `${readyCount} completed`;
    }
    else {
        readyItems[0].textContent = `0 completed`;
    }
}

// Function to run first of all after page is loaded so listeners is added and todo-list gets loaded into the DOM
function firstRun() {
    cleanInputField();
    if (addButton[0] && inputField[0]) {
        addButton[0].addEventListener('click', addToDo);
        inputField[0].addEventListener('keydown', (event) => {
            if (event.key == 'Enter') {
                addToDo();
            }
            return;
        });
    }
    else {
        console.log('Variabels connected to the DOM has returned null');
    }
    todoList = getFromLocal();
    if (todoList){
        todoList.forEach(item => {
            addRowToHTML(item);
            if (item.done) {
                readyItemCounter++;
            }   
        });
    } else {
        todoList = [];
    }
}

// ##################################################################################################
// ##################### Functions misc #############################################################

// Using trim to clean the input
const cleanInput = (textToClean) => {
    const cleanText = textToClean.trim(); // Här behöver man göra en rengöring av strängen med regex också?
    return cleanText;
}

// reset warning message
const resetWarning = () => {
    taskAlreadyExist[0].classList.remove('todo-container__warning-message--flashing-text');
    taskAlreadyExist[0].textContent = "";
}

// Clean the input field
const cleanInputField = () => {
    inputField[0].value = "";
}

// ##################################################################################################
// ##################### Functions to manipulate tasks ##############################################

// Function to find the index in todoList of a given task
const taskFinder = (findText) => {
    todoList = getFromLocal();
    let arrayIndex = -1;
    let arrayCounter = 0;
    todoList.forEach(item => {
        if (item.todo.toUpperCase() == findText.toUpperCase()){
            arrayIndex = arrayCounter;
            if (item.done == true && readyItemCounter > 0){
                readyItemCounter--;
            }
        }
        arrayCounter++;
    });
    return arrayIndex;
}

// Function to udate a task status, if done then undone and vice versa
const changeTask = (klick) => {
    const whichItem = klick.target;
    const itemToChange = taskFinder(whichItem.textContent);
    if (!(itemToChange == -1)) { readycounter
        if (whichItem.classList.contains('todo-container__todo-item-content--item-done') && todoList[itemToChange].done) {
            whichItem.classList.remove('todo-container__todo-item-content--item-done');
            todoList[itemToChange].done = false;
            if (readyItemCounter > 0) {
                readyItemCounter--;
            }
            updateLocalDone(itemToChange, false);
        } else {
            whichItem.classList.add('todo-container__todo-item-content--item-done');
            todoList[itemToChange].done = true;
            updateLocalDone(itemToChange, true);
            readyItemCounter++;
        }
        updateReady(readyItemCounter);
    }
}

//Function to remove items from list, both visble, saved array and local storage
const removeTask = (klick) => {
    const whichItem = klick.target;
    const textToSearch = whichItem.parentNode.firstChild.textContent;
    const itemToRemove = taskFinder(textToSearch);
    if (!(itemToRemove == -1)) {
        todoList.splice(itemToRemove, 1);
        localStorage.removeItem(`task${itemToRemove}`);
        whichItem.parentNode.remove();
    }
    updateReady(readyItemCounter);
}

// Function to add tasks to the todolist, DOM, Array and Local Storage
function addToDo() {
    let itemToAddInput = inputField[0].value;
    if (!(itemToAddInput == '' || itemToAddInput == null)) {
        const  itemToAddClean = cleanInput(itemToAddInput);
        const checkTaskExist = taskFinder(itemToAddClean);
        let taskToAdd = {todo: itemToAddClean, done: false}
        if (checkTaskExist == -1){
            resetWarning();
            addRowToHTML(taskToAdd);
            todoList.push(taskToAdd);
            saveToLocal(taskToAdd);
            cleanInputField();
        } else {
            taskAlreadyExist[0].classList.add('todo-container__warning-message--flashing-text');
            taskAlreadyExist[0].textContent = "That task already exist. Try another name"
            cleanInputField();
            setTimeout(resetWarning, 3000);
        }
    } else {
        taskAlreadyExist[0].classList.add('todo-container__warning-message--flashing-text');
        taskAlreadyExist[0].textContent = "Input must not be empty";
        setTimeout(resetWarning, 3000);
        
    }
    updateReady(readyItemCounter);
}

// ##################################################################################################

firstRun();

updateReady(readyItemCounter);
