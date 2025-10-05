// My javascript used for a todo-list

// Declaring global variabels and constants
let todoList = []; // Starting with an empty arry for tasks, it will get filled by saved items or by user
const inputField = document.querySelector('#newTaskInput');
const addButton = document.querySelector('#addButton');
const listShown = document.querySelector('#todoList');
const readyItems = document.querySelector('#readyItems');
const taskAlreadyExist = document.querySelector('#task-already-exist');

let readyItemCounter = 0;
// ##################################################################################################



// #################### Functions to work with local storage ########################################
// Function to save task to local storage
const saveToLocal = (itemToSave, index = (todoList.length - 1)) => {
    localStorage.setItem(`task${index}`, JSON.stringify(itemToSave));
}

// Function to update tasks in local storage
const updateLocalDone = (item, state) => {
    let itemTochange = JSON.parse(localStorage.getItem(`task${item}`));
    let itemToLoadBack = {todo: itemTochange.todo, done: state};
    localStorage.setItem(`task${item}`, JSON.stringify(itemToLoadBack));
}   

// Function to get tasks from local storage
const getFromLocal = () => { 
    let indexCounter = 0;
    let  savedTaskArray = [];
    while (indexCounter < localStorage.length) {
        let storageKey = localStorage.key(indexCounter);
        let retrievedObject = JSON.parse(localStorage.getItem(storageKey));
        let newObject = {todo: retrievedObject.todo, done: retrievedObject.done};
        savedTaskArray[indexCounter] = newObject;
        indexCounter++;
    }
    //  To fix errors with keys, clear storage and resave
    localStorage.clear();
    let reIndex = 0;
    savedTaskArray.forEach(item => {
        saveToLocal(item, reIndex);
        reIndex++;
    });
    return savedTaskArray;
}

// ##################################################################################################

// ###################### Functions to manipulate the DOM ###########################################
// Function to add ONE row of the tasklist to the DOM 
const addRowToHTML = (taskItem) => {
    // Her we create all neccesary DOM nodes for our task
            const itemAdd = document.createElement('li');
            const itemText = document.createElement('span');
            const trashCan = document.createElement('span');
            
            // First we create the trashcan and connect a listener to it
            trashCan.innerHTML = '&#x1F5D1;';
            trashCan.setAttribute('class', 'trashCan');
            trashCan.addEventListener('click', removeTask);
            
            // Second we create our task with its text content
            itemText.textContent = taskItem.todo;
            if(taskItem.done){
                itemText.classList.add('itemDone');
            }
            itemText.classList.add('list-text-content');
            itemText.addEventListener('click', changeTask);
            itemText.addEventListener('dblclick', removeTask);
            
            // Third we put together our complet item to show our task
            itemAdd.appendChild(itemText);
            itemAdd.appendChild(trashCan);
            listShown.appendChild(itemAdd);
}

// Update the visible readycounter in page
const updateReady = (readyCount) => {    
    if (readyCount > 0) {
        readyItems.textContent = `${readyCount} completed`;
    }
    else {
        readyItems.textContent = `0 completed`;
    }
}

// Function to run first of all after page is loaded so listeners is added and todo-list gets loaded into the DOM
function firstRun() {
    // Making sure the input field is clean at start
    cleanInputField();
    // Adding listeners if addButton and inputField exists, if not log out an error message in console
    if (addButton && inputField) {
        addButton.addEventListener('click', addToDo);
        inputField.addEventListener('keydown', (event) => {
            if (event.key == 'Enter') {
                addToDo();
            }
            return;
        });
    }
    else {
        console.log('Variabler kopplade till DOM har returnerat null');
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

// Using ??? to clean the input from any bad content
const cleanInput = (textToClean) => {
    const cleanText = textToClean; // Här behöver man göra en rengöring av strängen med regex eller trim?
    return cleanText;
}

// reset warning message
const resetWarning = () => {
    taskAlreadyExist.classList.remove('flash');
    taskAlreadyExist.textContent = "";
}

// Clean the input field
const cleanInputField = () => {
    inputField.value = "";
}
// ##################################################################################################

// ##################### Functions to manipulate tasks ##############################################

// Function to find the index in todoList of a given task
const taskFinder = (findText) => {
    // First of all reload the todolist from local storage
    todoList = getFromLocal();
    // find the task in the array and return index, if none found return '-1'
    let arrayIndex = -1;
    let arrayCounter = 0;
    todoList.forEach(item => {
        if (item.todo.toUpperCase() == findText.toUpperCase()){ // Using toUpperCase() so we not get fooled by different case of letters
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
    // Check if task exist in tasklist array
    const itemToChange = taskFinder(whichItem.textContent);

    // If task exist we can change it
    if (!(itemToChange == -1)) {
        
        // If task is already done, change it back to undone, otherwise mark it as done and last update readycounter
        if (whichItem.classList.contains('itemDone') && todoList[itemToChange].done) {
            whichItem.classList.remove('itemDone');
            todoList[itemToChange].done = false;
            if (readyItemCounter > 0) {
                readyItemCounter--;
                console.log('item to not done');
            }
            // We also update the task in localStorage
            updateLocalDone(itemToChange, false);
        } else {
            whichItem.classList.add('itemDone');
            todoList[itemToChange].done = true;
            readyItemCounter++;
            console.log('Item to done');

            // We also update the task in localStorage
            updateLocalDone(itemToChange, true);
        }
        
        // Update visible readycounter
        updateReady(readyItemCounter);
    }
}

//Function to remove items from list, both visble, saved array and local storage
const removeTask = (klick) => {
    const whichItem = klick.target;
    const textToSearch = whichItem.parentNode.firstChild.textContent;
    const itemToRemove = taskFinder(textToSearch);

    // If task does not exist, 'itemToRemove = -1' do nothing
    if (!(itemToRemove == -1)) {
        
        // Remove task from array and page
        todoList.splice(itemToRemove, 1);
        localStorage.removeItem(`task${itemToRemove}`);
        whichItem.parentNode.remove();
    }
    // Update visible counter on exit from function
    updateReady(readyItemCounter);
}

// Function to add tasks to the todolist, DOM, Array and Local Storage
function addToDo() {
    let itemToAddInput = inputField.value;
    
    // If input is empty or doesn't exist we do nothing
    if (!(itemToAddInput == '' || itemToAddInput == null)) {
        // Sending input to be cleaned by DOMPurify
        const  itemToAddClean = cleanInput(itemToAddInput);

        // ######## Under this line, we do not use dirty input itemToAddInput #######################

        // We check if task already exist, if not we can add it
        const checkTaskExist = taskFinder(itemToAddClean);

        // We create the JSON Object to save and show
        let taskToAdd = {todo: itemToAddClean, done: false}
        
        // If task didn't exist we will add it / (-1) = task didn't exist
        if (checkTaskExist == -1){
            // Clean comment-field just to be sure
            resetWarning();
            
            // Send the task to be added to list in DOM
            addRowToHTML(taskToAdd);

            // Here we push our task to the array
            todoList.push(taskToAdd);

            // Save the Item to local storage
            saveToLocal(taskToAdd);
            
            // Last we clean the the input field
            cleanInputField();
        } else {
            // If task already existed, we let the user know
            taskAlreadyExist.classList.add('flash');
            taskAlreadyExist.textContent = "That task already exist. Try another name"
            setTimeout(cleanInputField, 3200);
            setTimeout(resetWarning, 3000);
        }
    } else {
        taskAlreadyExist.classList.add('flash');
        taskAlreadyExist.textContent = "Input must not be empty";
        setTimeout(resetWarning, 3000);
        
    }
    updateReady(readyItemCounter);
}

// ##################################################################################################

// Check if there is any saved tasks from before
firstRun();

// Update visible readycounter after first run has checked the todo-list
updateReady(readyItemCounter);
