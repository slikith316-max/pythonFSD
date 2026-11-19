
// ---------- DOM Elements ----------

const habitForm = document.getElementById("habitForm");
const habitInput = document.getElementById("habitInput");
const habitList = document.getElementById("habitList");
const emptyMessage = document.getElementById("emptyMessage");

const totalHabits = document.getElementById("totalHabits");
const completedHabits = document.getElementById("completedHabits");

// ---------- Local Storage ----------

const STORAGE_KEY = "habitTrackerData";

// Retrieve saved habits or start with an empty array.
let habits = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];

// Save habits to localStorage.
function saveHabits() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(habits));
}

// ---------- Date Functions ----------

// Get today's date in local YYYY-MM-DD format.
function getToday() {
    const date = new Date();

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

// Get yesterday's date.
function getYesterday() {
    const date = new Date();
    date.setDate(date.getDate() - 1);

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

// ---------- Streak Calculation ----------

function calculateStreak(completionDates) {

    if (!completionDates || completionDates.length === 0) {
        return 0;
    }

    // Remove duplicate dates and sort them.
    const dates = [...new Set(completionDates)].sort();

    const completedSet = new Set(dates);

    // A streak continues if completed today or yesterday.
    let currentDate = completedSet.has(getToday())
        ? new Date()
        : new Date(getYesterday() + "T12:00:00");

    let streak = 0;

    // Count consecutive completed days backwards.
    while (true) {

        const year = currentDate.getFullYear();
        const month = String(currentDate.getMonth() + 1).padStart(2, "0");
        const day = String(currentDate.getDate()).padStart(2, "0");

        const dateString = `${year}-${month}-${day}`;

        if (completedSet.has(dateString)) {
            streak++;
            currentDate.setDate(currentDate.getDate() - 1);
        } else {
            break;
        }
    }

    return streak;
}

// ---------- Add Habit ----------

habitForm.addEventListener("submit", function(event) {

    event.preventDefault();

    const habitName = habitInput.value.trim();

    // Prevent empty habits.
    if (habitName === "") {
        alert("Please enter a habit name!");
        habitInput.focus();
        return;
    }

    // Create a new habit object.
    const newHabit = {
        id: Date.now().toString() + Math.random().toString(36).slice(2),
        name: habitName,
        completionDates: []
    };

    habits.push(newHabit);

    saveHabits();
    renderHabits();

    // Clear input field.
    habitInput.value = "";
    habitInput.focus();
});

// ---------- Toggle Habit Completion ----------

function toggleHabit(habitId) {

    const habit = habits.find(item => item.id === habitId);

    if (!habit) return;

    const today = getToday();

    // Toggle today's completion status.
    if (habit.completionDates.includes(today)) {

        habit.completionDates = habit.completionDates.filter(
            date => date !== today
        );

    } else {

        habit.completionDates.push(today);

    }

    saveHabits();
    renderHabits();
}

// ---------- Delete Habit ----------

function deleteHabit(habitId) {

    const confirmed = confirm("Are you sure you want to delete this habit?");

    if (!confirmed) return;

    habits = habits.filter(item => item.id !== habitId);

    saveHabits();
    renderHabits();
}

// ---------- Render Habits ----------

function renderHabits() {

    // Clear previous habit cards.
    habitList.innerHTML = "";

    const today = getToday();

    let completedCount = 0;

    habits.forEach(habit => {

        const isCompleted = habit.completionDates.includes(today);

        if (isCompleted) {
            completedCount++;
        }

        const streak = calculateStreak(habit.completionDates);

        // Create habit card.
        const habitCard = document.createElement("div");

        habitCard.className = isCompleted
            ? "habit-card completed"
            : "habit-card";

        // Habit information.
        const habitInfo = document.createElement("div");
        habitInfo.className = "habit-info";

        const habitName = document.createElement("h3");
        habitName.textContent = habit.name;

        const streakInfo = document.createElement("p");
        streakInfo.textContent = `🔥 ${streak} day streak`;

        habitInfo.appendChild(habitName);
        habitInfo.appendChild(streakInfo);

        // Action buttons.
        const actions = document.createElement("div");
        actions.className = "habit-actions";

        const completeButton = document.createElement("button");
        completeButton.className = "complete-button";

        completeButton.textContent = isCompleted
            ? "✓ Done"
            : "Complete";

        completeButton.addEventListener("click", function() {
            toggleHabit(habit.id);
        });

        const deleteButton = document.createElement("button");
        deleteButton.className = "delete-button";
        deleteButton.textContent = "Delete";

        deleteButton.addEventListener("click", function() {
            deleteHabit(habit.id);
        });

        actions.appendChild(completeButton);
        actions.appendChild(deleteButton);

        // Assemble habit card.
        habitCard.appendChild(habitInfo);
        habitCard.appendChild(actions);

        habitList.appendChild(habitCard);

    });

    // Update statistics.
    totalHabits.textContent = habits.length;
    completedHabits.textContent = completedCount;

    // Show or hide empty message.
    emptyMessage.classList.toggle("hidden", habits.length > 0);
}

// ---------- Initial Application Load ----------

// Display saved habits when the page loads.
renderHabits();
