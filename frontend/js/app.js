const API_URL = "http://localhost:3000/api/expenses";
let expenses = [];

const addForm = document.getElementById("addExpenseForm");
const tableBody = document.getElementById("expenseTableBody");
const filterSelect = document.getElementById("filterCategory");
const editForm = document.getElementById("editForm");
const alertContainer = document.getElementById("alertContainer");
const loadingSpinner = document.getElementById("loadingSpinner");
const tableContainer = document.getElementById("tableContainer");

const editModalElement = document.getElementById("editModal");
let editModal;
if (editModalElement) {
  editModal = new bootstrap.Modal(editModalElement);
}

function showAlert(message, type = "danger") {
  alertContainer.innerHTML = `
        <div class="alert alert-${type} alert-dismissible fade show shadow-sm" role="alert">
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
    `;
  setTimeout(() => {
    alertContainer.innerHTML = "";
  }, 5000);
}

function toggleSpinner(show) {
  if (show) {
    loadingSpinner.classList.remove("d-none");
    tableContainer.classList.add("d-none");
  } else {
    loadingSpinner.classList.add("d-none");
    tableContainer.classList.remove("d-none");
  }
}

async function fetchExpenses() {
  toggleSpinner(true);
  try {
    const response = await fetch(API_URL);
    if (!response.ok) {
      throw new Error("Server error");
    }
    expenses = await response.json();
    renderDashboard();
  } catch (error) {
    showAlert(
      "Cannot connect to the server. Please ensure the backend is running.",
    );
  } finally {
    toggleSpinner(false);
  }
}

function renderDashboard() {
  updateSummaryCards();
  renderTable();
}

function updateSummaryCards() {
  const count = expenses.length;
  let total = 0;

  for (let i = 0; i < count; i++) {
    total = total + expenses[i].amount;
  }

  let maxExpense = null;

  if (expenses.length > 0) {
    maxExpense = expenses[0];

    for (let i = 1; i < count; i++) {
      if (expenses[i].amount > maxExpense.amount) {
        maxExpense = expenses[i];
      }
    }
  }

  document.getElementById("expensesCount").textContent = count;
  document.getElementById("totalAmount").textContent = total.toFixed(2);

  if (maxExpense) {
    document.getElementById("highestAmount").textContent =
      maxExpense.amount.toFixed(2);
    document.getElementById("highestCategory").textContent =
      maxExpense.category;
  } else {
    document.getElementById("highestAmount").textContent = "0.00";
    document.getElementById("highestCategory").textContent = "-";
  }
}

function renderTable() {
  tableBody.innerHTML = "";
  const selectedCategory = filterSelect.value;

  const filteredExpenses = expenses.filter((exp) => {
    return selectedCategory === "All"
      ? true
      : exp.category === selectedCategory;
  });

  filteredExpenses.forEach((exp) => {
    const tr = document.createElement("tr");

    const tdTitle = document.createElement("td");
    tdTitle.textContent = exp.title;
    tr.appendChild(tdTitle);

    const tdAmount = document.createElement("td");
    tdAmount.textContent = exp.amount.toFixed(2);
    tr.appendChild(tdAmount);

    const tdCategory = document.createElement("td");
    const badge = document.createElement("span");
    let badgeColor = "";

    switch (exp.category) {
      case "Food":
        badgeColor = "bg-success";
        break;
      case "Transport":
        badgeColor = "bg-primary";
        break;
      case "Bills":
        badgeColor = "bg-warning text-dark";
        break;
      case "Entertainment":
        badgeColor = "bg-info text-dark";
        break;
      case "Other":
        badgeColor = "bg-secondary";
        break;
      default:
        badgeColor = "bg-dark";
    }

    badge.className = `badge ${badgeColor}`;
    badge.textContent = exp.category;
    tdCategory.appendChild(badge);
    tr.appendChild(tdCategory);

    const tdDate = document.createElement("td");
    tdDate.textContent = exp.date;
    tr.appendChild(tdDate);

    const tdActions = document.createElement("td");
    tdActions.className = "text-end";

    const editBtn = document.createElement("button");
    editBtn.className = "btn btn-sm btn-outline-secondary me-2";
    editBtn.textContent = "Edit";
    editBtn.onclick = () => openEditModal(exp);

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "btn btn-sm btn-outline-danger";
    deleteBtn.textContent = "Delete";
    deleteBtn.onclick = () => deleteExpense(exp.id);

    tdActions.appendChild(editBtn);
    tdActions.appendChild(deleteBtn);
    tr.appendChild(tdActions);

    tableBody.appendChild(tr);
  });
}

addForm.addEventListener("submit", async function (e) {
  e.preventDefault();

  const titleInput = document.getElementById("title");
  const amountInput = document.getElementById("amount");
  const categoryInput = document.getElementById("category");
  const dateInput = document.getElementById("date");

  const title = titleInput.value.trim();
  const amount = parseFloat(amountInput.value);
  const category = categoryInput.value;
  const date = dateInput.value;

  let hasError = false;

  if (!title) {
    titleInput.setCustomValidity("Invalid");
    hasError = true;
  } else {
    titleInput.setCustomValidity("");
  }
  if (isNaN(amount) || amount <= 0) {
    amountInput.setCustomValidity("Invalid");
    hasError = true;
  } else {
    amountInput.setCustomValidity("");
  }
  if (!category) {
    categoryInput.setCustomValidity("Invalid");
    hasError = true;
  } else {
    categoryInput.setCustomValidity("");
  }
  if (!date) {
    dateInput.setCustomValidity("Invalid");
    hasError = true;
  } else {
    dateInput.setCustomValidity("");
  }

  addForm.classList.add("was-validated");
  if (hasError) return;

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, amount, category, date }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      showAlert(errorData.error || "Failed to add expense.");
      return;
    }

    addForm.reset();
    addForm.classList.remove("was-validated");
    showAlert("Expense added successfully!", "success");
    fetchExpenses();
  } catch (error) {
    showAlert("Server is offline. Could not add expense.");
  }
});

function openEditModal(exp) {
  document.getElementById("editExpenseId").value = exp.id;
  document.getElementById("editTitle").value = exp.title;
  document.getElementById("editAmount").value = exp.amount;
  document.getElementById("editCategory").value = exp.category;
  document.getElementById("editDate").value = exp.date;

  editForm.classList.remove("was-validated");
  editModal.show();
}

editForm.addEventListener("submit", async function (e) {
  e.preventDefault();

  const id = document.getElementById("editExpenseId").value;
  const titleInput = document.getElementById("editTitle");
  const amountInput = document.getElementById("editAmount");
  const categoryInput = document.getElementById("editCategory");
  const dateInput = document.getElementById("editDate");

  const title = titleInput.value.trim();
  const amount = parseFloat(amountInput.value);
  const category = categoryInput.value;
  const date = dateInput.value;

  let hasError = false;

  if (!title) {
    titleInput.setCustomValidity("Invalid");
    hasError = true;
  } else {
    titleInput.setCustomValidity("");
  }
  if (isNaN(amount) || amount <= 0) {
    amountInput.setCustomValidity("Invalid");
    hasError = true;
  } else {
    amountInput.setCustomValidity("");
  }
  if (!category) {
    categoryInput.setCustomValidity("Invalid");
    hasError = true;
  } else {
    categoryInput.setCustomValidity("");
  }
  if (!date) {
    dateInput.setCustomValidity("Invalid");
    hasError = true;
  } else {
    dateInput.setCustomValidity("");
  }

  editForm.classList.add("was-validated");
  if (hasError) return;

  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, amount, category, date }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      showAlert(errorData.error || "Failed to update expense.");
      return;
    }

    editModal.hide();
    showAlert("Expense updated successfully!", "success");
    fetchExpenses();
  } catch (error) {
    showAlert("Server is offline. Could not update expense.");
  }
});

async function deleteExpense(id) {
  if (!confirm("Are you sure you want to delete this expense?")) return;

  try {
    const response = await fetch(`${API_URL}/${id}`, { method: "DELETE" });

    if (!response.ok) {
      const errorData = await response.json();
      showAlert(errorData.error || "Failed to delete expense.");
      return;
    }

    showAlert("Expense deleted successfully!", "success");
    fetchExpenses();
  } catch (error) {
    showAlert("Server is offline. Could not delete expense.");
  }
}

filterSelect.addEventListener("change", renderTable);

fetchExpenses();
