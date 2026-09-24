// ===============================
// DAILY RAVEN v1.0
// ===============================

const today = new Date();

function dateString(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");

  return `${y}-${m}-${d}`;
}

// -------------------------------
// APP START
// -------------------------------

document.addEventListener("DOMContentLoaded", () => {

  document.getElementById("taskDate").value = dateString();
  document.getElementById("moneyDate").value = dateString();
  document.getElementById("loanDate").value = dateString();

  document.getElementById("noteText").addEventListener("input", () => {
    document.getElementById("charCount").textContent =
      document.getElementById("noteText").value.length;
  });

  checkRegistration();
  loadTasks();
  loadMoney();
  loadLoans();
  loadNotes();
});


// -------------------------------
// REGISTRATION
// -------------------------------

function showRegistration() {
  document.getElementById("welcomeScreen").classList.add("hidden");
  document.getElementById("registrationScreen").classList.remove("hidden");
}

function saveRegistration() {

  const name = document.getElementById("nameInput").value.trim();
  const age = document.getElementById("ageInput").value.trim();
  const school = document.getElementById("schoolInput").value.trim();

  if (!name || !age) {
    alert("Name এবং Age অবশ্যই দিতে হবে।");
    return;
  }

  const user = {
    name,
    age,
    school
  };

  localStorage.setItem("dailyRavenUser", JSON.stringify(user));

  startApp();
}

function checkRegistration() {

  const user = localStorage.getItem("dailyRavenUser");

  if (user) {
    startApp();
  }
}

function startApp() {

  const user = JSON.parse(
    localStorage.getItem("dailyRavenUser")
  );

  document.getElementById("welcomeUser").textContent =
    `Welcome, ${user.name} 👋`;

  document.getElementById("welcomeScreen").classList.add("hidden");
  document.getElementById("registrationScreen").classList.add("hidden");
  document.getElementById("appScreen").classList.remove("hidden");

  loadTasks();
  loadMoney();
  loadLoans();
  loadNotes();
}

function logout() {

  if (confirm("সব তথ্য মুছে registration নতুন করে করতে চান?")) {

    localStorage.clear();

    location.reload();
  }
}


// -------------------------------
// PAGE NAVIGATION
// -------------------------------

function openPage(page) {

  document.querySelectorAll(".page").forEach(p => {
    p.classList.add("hidden");
  });

  document.getElementById(page).classList.remove("hidden");

  if (page === "tasks") loadTasks();
  if (page === "money") {
    loadMoney();
    loadLoans();
  }
  if (page === "notes") loadNotes();
}


// -------------------------------
// DAILY TASKS
// -------------------------------

function getTasks() {

  return JSON.parse(
    localStorage.getItem("dailyRavenTasks") || "{}"
  );
}

function saveTasks() {

  const date = document.getElementById("taskDate").value;

  const inputs = document.querySelectorAll(".task-input");
  const checks = document.querySelectorAll(".task-check");

  const tasks = getTasks();

  tasks[date] = [];

  for (let i = 0; i < 10; i++) {

    tasks[date].push({
      text: inputs[i].value,
      completed: checks[i].checked
    });
  }

  localStorage.setItem(
    "dailyRavenTasks",
    JSON.stringify(tasks)
  );

  alert("কাজগুলো সংরক্ষণ হয়েছে ✅");

  showFutureTasks();
}

function loadTasks() {

  const dateInput = document.getElementById("taskDate");

  if (!dateInput) return;

  let date = dateInput.value || dateString();

  dateInput.value = date;

  const tasks = getTasks();

  const saved = tasks[date] || [];

  let html = "";

  for (let i = 0; i < 10; i++) {

    const item = saved[i] || {
      text: "",
      completed: false
    };

    html += `
      <div class="task-row">

        <span class="task-number">${i + 1}.</span>

        <input
          type="checkbox"
          class="task-check"
          ${item.completed ? "checked" : ""}
          onchange="updateTaskStyle(this)"
        >

        <input
          type="text"
          class="task-input ${item.completed ? "task-completed" : ""}"
          value="${escapeHTML(item.text)}"
          placeholder="আজকের কাজ..."
        >

      </div>
    `;
  }

  document.getElementById("taskList").innerHTML = html;

  updateDateMessage(date);
  showFutureTasks();
}

function updateTaskStyle(check) {

  const input = check.parentElement.querySelector(".task-input");

  input.classList.toggle(
    "task-completed",
    check.checked
  );
}

function updateDateMessage(date) {

  const todayDate = dateString();

  const message = document.getElementById("dateMessage");

  if (date > todayDate) {
    message.textContent =
      "🔔 এটি ভবিষ্যতের দিনের কাজ। নির্দিষ্ট তারিখে এটি সামনে আসবে।";
  }
  else if (date === todayDate) {
    message.textContent =
      "📌 আজকের কাজ";
  }
  else {
    message.textContent =
      "📖 পুরোনো দিনের কাজ";
  }
}

function showFutureTasks() {

  const container = document.getElementById("futureTasks");

  if (!container) return;

  const tasks = getTasks();
  const todayDate = dateString();

  let html = "";

  Object.keys(tasks)
    .filter(date => date > todayDate)
    .sort()
    .forEach(date => {

      const activeTasks = tasks[date].filter(
        task => task.text.trim() !== ""
      );

      if (!activeTasks.length) return;

      html += `
        <div class="future-item">
          <strong>📅 ${date}</strong>
          <ul>
            ${activeTasks.map(
              task => `<li>${escapeHTML(task.text)}</li>`
            ).join("")}
          </ul>
        </div>
      `;
    });

  container.innerHTML =
    html || "<p>কোনো ভবিষ্যৎ কাজ নেই।</p>";
}


// -------------------------------
// MONEY
// -------------------------------

function getMoney() {

  return JSON.parse(
    localStorage.getItem("dailyRavenMoney") || "[]"
  );
}

function addMoney() {

  const date =
    document.getElementById("moneyDate").value;

  const type =
    document.getElementById("moneyType").value;

  const source =
    document.getElementById("moneySource").value.trim();

  const amount =
    Number(document.getElementById("moneyAmount").value);

  if (!source || !amount) {
    alert("উৎস এবং পরিমাণ দিন।");
    return;
  }

  const money = getMoney();

  money.push({
    id: Date.now(),
    date,
    type,
    source,
    amount
  });

  localStorage.setItem(
    "dailyRavenMoney",
    JSON.stringify(money)
  );

  document.getElementById("moneySource").value = "";
  document.getElementById("moneyAmount").value = "";

  loadMoney();
}

function loadMoney() {

  const container = document.getElementById("moneyList");

  if (!container) return;

  const money = getMoney();

  let income = 0;
  let expense = 0;

  money.forEach(item => {

    if (item.type === "income")
      income += item.amount;

    else
      expense += item.amount;
  });

  document.getElementById("moneySummary").innerHTML = `
    <p>🟢 মোট আয়: ৳${income}</p>
    <p>🔴 মোট ব্যয়: ৳${expense}</p>
    <p>💵 ব্যালেন্স: ৳${income - expense}</p>
  `;

  container.innerHTML = money
    .slice()
    .reverse()
    .map(item => `
      <div class="money-item">

        <strong>
          ${item.type === "income" ? "🟢 আয়" : "🔴 ব্যয়"}
        </strong>

        <p>${escapeHTML(item.source)}</p>
        <p>৳${item.amount} — ${item.date}</p>

        <button
          class="delete"
          onclick="deleteMoney(${item.id})">
          Delete
        </button>

      </div>
    `).join("");
}

function deleteMoney(id) {

  const money = getMoney().filter(
    item => item.id !== id
  );

  localStorage.setItem(
    "dailyRavenMoney",
    JSON.stringify(money)
  );

  loadMoney();
}


// -------------------------------
// LOAN / DUE
// -------------------------------

function getLoans() {

  return JSON.parse(
    localStorage.getItem("dailyRavenLoans") || "[]"
  );
}

function addLoan() {

  const person =
    document.getElementById("loanPerson").value.trim();

  const amount =
    Number(document.getElementById("loanAmount").value);

  const date =
    document.getElementById("loanDate").value;

  const type =
    document.getElementById("loanType").value;

  if (!person || !amount || !date) {
    alert("সব তথ্য পূরণ করুন।");
    return;
  }

  const loans = getLoans();

  loans.push({
    id: Date.now(),
    person,
    amount,
    date,
    type,
    paid: false
  });

  localStorage.setItem(
    "dailyRavenLoans",
    JSON.stringify(loans)
  );

  document.getElementById("loanPerson").value = "";
  document.getElementById("loanAmount").value = "";

  loadLoans();
}

function loadLoans() {

  const container =
    document.getElementById("loanList");

  if (!container) return;

  const loans = getLoans();

  container.innerHTML = loans
    .slice()
    .reverse()
    .map(item => `

      <div class="loan-item">

        <strong>
          ${item.type === "taken"
            ? "📥 আমি নিয়েছি"
            : "📤 আমি দিয়েছি"}
        </strong>

        <p>${escapeHTML(item.person)}</p>
        <p>৳${item.amount}</p>
        <p>📅 ${item.date}</p>

        <button
          class="${item.paid ? "edit" : "delete"}"
          onclick="toggleLoan(${item.id})">

          ${item.paid ? "Paid ✅" : "Unpaid"}

        </button>

        <button
          class="delete"
          onclick="deleteLoan(${item.id})">
          Delete
        </button>

      </div>

    `).join("");
}

function toggleLoan(id) {

  const loans = getLoans();

  const item = loans.find(
    loan => loan.id === id
  );

  if (item) {
    item.paid = !item.paid;
  }

  localStorage.setItem(
    "dailyRavenLoans",
    JSON.stringify(loans)
  );

  loadLoans();
}

function deleteLoan(id) {

  const loans = getLoans().filter(
    loan => loan.id !== id
  );

  localStorage.setItem(
    "dailyRavenLoans",
    JSON.stringify(loans)
  );

  loadLoans();
}


// -------------------------------
// NOTES
// -------------------------------

function getNotes() {

  return JSON.parse(
    localStorage.getItem("dailyRavenNotes") || "[]"
  );
}

function saveNote() {

  const title =
    document.getElementById("noteTitle").value.trim();

  const text =
    document.getElementById("noteText").value;

  if (!title || !text.trim()) {
    alert("Title এবং Note লিখুন।");
    return;
  }

  if (text.length > 2000) {
    alert("সর্বোচ্চ ২০০০ বর্ণ লেখা যাবে।");
    return;
  }

  const notes = getNotes();

  notes.push({
    id: Date.now(),
    title,
    text,
    date: dateString()
  });

  localStorage.setItem(
    "dailyRavenNotes",
    JSON.stringify(notes)
  );

  document.getElementById("noteTitle").value = "";
  document.getElementById("noteText").value = "";
  document.getElementById("charCount").textContent = "0";

  loadNotes();
}

function loadNotes() {

  const container =
    document.getElementById("noteList");

  if (!container) return;

  const notes = getNotes();

  container.innerHTML = notes
    .slice()
    .reverse()
    .map(note => `

      <div class="note-item">

        <h3>${escapeHTML(note.title)}</h3>

        <p>${escapeHTML(note.text)}</p>

        <small>${note.date}</small>

        <br>

        <button
          class="delete"
          onclick="deleteNote(${note.id})">
          Delete
        </button>

      </div>

    `).join("");
}

function deleteNote(id) {

  const notes = getNotes().filter(
    note => note.id !== id
  );

  localStorage.setItem(
    "dailyRavenNotes",
    JSON.stringify(notes)
  );

  loadNotes();
}


// -------------------------------
// SECURITY / HTML ESCAPE
// -------------------------------

function escapeHTML(value) {

  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
