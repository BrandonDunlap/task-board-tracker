// Retrieve tasks and nextId from localStorage
let taskList = JSON.parse(localStorage.getItem("tasks"));
let nextId = JSON.parse(localStorage.getItem("nextId"));

// Generate a unique task id
function generateTaskId() {
  return 'task-' + nextId++;
  // Save nextId back to localStorage
  localStorage.setItem("nextId", JSON.stringify(nextId));
}

// Create a task card
function createTaskCard(task) {
  let dueDate = dayjs(task.dueDate);
  let currentDate = dayjs();

  // Calculate days remaining
  let daysRemaining = dueDate.diff(currentDate, 'day');
  let colorClass = '';

  // Apply color coding
  if (daysRemaining < 0) {
    colorClass = 'bg-danger text-white'; // Overdue
  } else if (daysRemaining <= 3) {
    colorClass = 'bg-warning'; // Nearing deadline
  }

  let card = `
    <div class="card mb-2 task-card ${colorClass}" data-id="${task.id}">
      <div class="card-body">
        <h5 class="card-title">${task.title}</h5>
        <p class="card-text">${task.description}</p>
        <p class="card-text"><small class="text-muted">Due: ${task.dueDate}</small></p>
        <button class="btn btn-danger btn-sm delete-btn">Delete</button>
      </div>
    </div>
  `;
  return card;
}

// Render the task list and make cards draggable
function renderTaskList() {
  // Clear current cards
  $('#todo-cards, #in-progress-cards, #done-cards').empty();

  // Render cards
  taskList.forEach(task => {
    let card = createTaskCard(task);
    $(`#${task.status}-cards`).append(card);
  });

  // Make cards draggable
  $('.task-card').draggable({
    revert: "invalid",
    start: function() {
      $(this).css('opacity', '0.5');
    },
    stop: function() {
      $(this).css('opacity', '1');
    }
  });

  // Make lanes droppable
  $('.lane').droppable({
    accept: ".task-card",
    drop: handleDrop
  });

  // Event listener for delete buttons
  $('.delete-btn').on('click', handleDeleteTask);
}

// Handle adding a new task
function handleAddTask(event) {
  event.preventDefault();

  // Get task details from the form
  let title = $('#task-title').val().trim();
  let description = $('#task-desc').val().trim();
  let dueDate = $('#task-due-date').val();

  if (title && description && dueDate) {
    let task = {
      id: generateTaskId(),
      title: title,
      description: description,
      dueDate: dueDate,
      status: 'todo'
    };

    // Add task to the list
    taskList.push(task);

    // Save tasks to localStorage
    localStorage.setItem("tasks", JSON.stringify(taskList));

    // Render task list
    renderTaskList();

    // Reset the form
    $('#task-form')[0].reset();

    // Close the modal
    $('#formModal').modal('hide');
  }
}

// Handle deleting a task
function handleDeleteTask(event) {
  let taskId = $(event.target).closest('.task-card').data('id');

  // Remove task from the list
  taskList = taskList.filter(task => task.id !== taskId);

  // Save tasks to localStorage
  localStorage.setItem("tasks", JSON.stringify(taskList));

  // Render task list
  renderTaskList();
}

// Handle dropping a task into a new status lane
function handleDrop(event, ui) {
  let taskId = ui.draggable.data('id');
  let newStatus = $(this).attr('id');

  // Update task status
  taskList.forEach(task => {
    if (task.id === taskId) {
      task.status = newStatus;
    }
  });

  // Save tasks to localStorage
  localStorage.setItem("tasks", JSON.stringify(taskList));

  // Render task list
  renderTaskList();
}

// When the page loads
$(document).ready(function () {
  if (!taskList) {
    taskList = [];
    localStorage.setItem("tasks", JSON.stringify(taskList));
  }

  if (!nextId) {
    nextId = 1;
    localStorage.setItem("nextId", JSON.stringify(nextId));
  }

  // Render task list
  renderTaskList();

  // Add event listener for add task button
  $('#task-form').on('submit', handleAddTask);

  // Make due date field a date picker
  $('#task-due-date').datepicker();
});
