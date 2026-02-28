// index.js

// addNewExpense function
function addNewExpense(expense = null) {
    addDiv.innerHTML = "";
    // setup header
    const addHeader = document.createElement("div");
    addHeader.className = "headerText";
    addHeader.innerHTML = "Add New Expense";
    addDiv.appendChild(addHeader);
 
    // setup date entry
    const dateEntry = document.createElement("input");
    dateEntry.type = "date";
    dateEntry.className = "input";
    if (expense) {
        dateEntry.value = expense.date;
    } else {
        const today = new Date();
        const localDate =
            today.getFullYear() + "-" +
            String(today.getMonth() + 1).padStart(2, "0") + "-" +
            String(today.getDate()).padStart(2, "0");
        dateEntry.value = localDate;
    }
    addDiv.appendChild(dateEntry);

    // setup list of categories
    const categoryDropdown = document.createElement("select");
    categoryDropdown.innerHTML = "";
    categoryDropdown.className = "input";
    const defaultCategory = document.createElement("option");
    defaultCategory.value = "";
    defaultCategory.textContent = "Category";
    defaultCategory.selected = true;
    defaultCategory.disabled = true;
    categoryDropdown.appendChild(defaultCategory);
    addDiv.appendChild(categoryDropdown);
    displayCategories(categoryDropdown).then(() => {
        if (expense) {
            categoryDropdown.value = expense.category_id;
        }
    });

    // setup list of payment types
    const paymentTypeDropdown = document.createElement("select");
    paymentTypeDropdown.innerHTML = "";
    paymentTypeDropdown.className = "input";
    const defaultPayment = document.createElement("option");
    defaultPayment.value = "";
    defaultPayment.textContent = "Payment Type";
    defaultPayment.selected = true;
    defaultPayment.disabled = true;
    paymentTypeDropdown.appendChild(defaultPayment);
    addDiv.appendChild(paymentTypeDropdown);
    displayPaymentTypes(paymentTypeDropdown).then(() => {
        if (expense) {
            paymentTypeDropdown.value = expense.payment_id;
        }
    });

    // setup amount entry
    const amountWrapper = document.createElement("div");
    amountWrapper.className = "currencyWrapper";
    const amount = document.createElement("input");
    amount.type = "text";
    amount.inputMode = "decimal";
    amount.placeholder = "0.00";
    amount.className = "input currencyInput";
    if (expense) {
        amount.value = Number(expense.amount).toFixed(2);
    }
    amountWrapper.appendChild(amount);
    addDiv.appendChild(amountWrapper);

    amount.addEventListener("blur", () => {
        if (!amount.value) return;
        const num = parseFloat(amount.value.replace(/[^0-9.]/g, ""));
        if (!isNaN(num)) {
            amount.value = num.toFixed(2);
        } else {
            amount.value = "";
        }
    });

    // setup notes
    const notes = document.createElement("input");
    notes.type = "text";
    notes.placeholder = "Note";
    notes.className = "input";
    if (expense) {
        notes.value = expense.notes || "";
    }
    addDiv.appendChild(notes);

    // save button
    const btnRow = document.createElement("div");
    btnRow.id = "btnRow";
    const saveBtn = document.createElement("button");
    saveBtn.textContent = expense ? "Update" : "Save";
    saveBtn.classList = "saveBtn";
    btnRow.appendChild(saveBtn);

    // delete button
    if (expense) {
        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "Delete";
        deleteBtn.className = "deleteBtn";
        btnRow.appendChild(deleteBtn);
        
        deleteBtn.addEventListener("click", async () => {
            const confirmed = confirm("Delete this expense?");
            if (!confirmed) return;

            deleteBtn.disabled = true;
            deleteBtn.textContent = "Deleting...";

            const res = await fetch("/api/deleteExpense", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ id: expense.id })
            });

            const result = await res.json();

            if (result.success) {
                alert("Expense deleted");
                addDiv.innerHTML = "";
                addNewExpense();
            } else {
                alert("Delete failed");
                deleteBtn.disabled = false;
                deleteBtn.textContent = "Delete";
            }   
        });
    }
    addDiv.appendChild(btnRow);

    // clear form after saving
    function clearExpenseForm() {
        // reset date to today
        const today = new Date();
        dateEntry.value =
            today.getFullYear() + "-" +
            String(today.getMonth() + 1).padStart(2, "0") + "-" +
            String(today.getDate()).padStart(2, "0");

        // reset dropdowns
        categoryDropdown.selectedIndex = 0;
        paymentTypeDropdown.selectedIndex = 0;

        // clear inputs
        amount.value = "";
        notes.value = "";
    }

    // event listener for saving
    saveBtn.addEventListener("click", async () => {
        saveBtn.disabled = true;
        saveBtn.innerHTML = "Wait...";
        const expenseData = {
            id: expense?.id,
            date: dateEntry.value,
            category_id: categoryDropdown.value,
            payment_id: paymentTypeDropdown.value,
            amount: Number(parseFloat(amount.value).toFixed(2)),
            notes: notes.value,
            user_id: parseInt(localStorage.getItem("userId"))
        };

        // validation
        if (!expenseData.date) {
            alert("Please select a date.");
            saveBtn.disabled = false;
            saveBtn.innerHTML = "Save";
            return;
        }
        if (!expenseData.category_id) {
            alert("Please select a category.");
            saveBtn.disabled = false;
            saveBtn.innerHTML = "Save";
            return;
        }
        if (!expenseData.payment_id) {
            alert("Please select a payment type.");
            saveBtn.disabled = false;
            saveBtn.innerHTML = "Save";
            return;
        }
        if (isNaN(expenseData.amount) || expenseData.amount <= 0) {
            alert("Please enter a valid amount.");
            saveBtn.disabled = false;
            saveBtn.innerHTML = "Save";
            return;
        }

        // send to backend
        const url = expense ? "/api/updateExpense" : "/api/saveExpense";
        const saveRes = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(expenseData)
        });
        const result = await saveRes.json();
        saveBtn.disabled = false;
        saveBtn.innerHTML = expense ? "Update" : "Save";
        alert("Expense saved!");
        if (!expense) {
            clearExpenseForm();
        } else {
            viewBtn.click();
        }
    });


}

// searchExpenses function
function searchExpenses() {
    // setup header 
    const searchHeader = document.createElement("div");
    searchHeader.className = "headerText";
    searchHeader.innerHTML = "Search Expenses";
    searchDiv.appendChild(searchHeader);

    // setup from date entry
    const fromDiv = document.createElement("div");
    fromDiv.className = "dateDiv";
    const fromDateEntry = document.createElement("input");
    fromDateEntry.type = "date";
    fromDateEntry.id = "fromDate";

    const todayFrom = new Date();
    const localFromDate =
        todayFrom.getFullYear() + "-" +
        String(todayFrom.getMonth() + 1).padStart(2, "0") + "-" +
        String(todayFrom.getDate()).padStart(2, "0");
    fromDateEntry.value = localFromDate;
    fromDateEntry.className = "input";
    const fromLabel = document.createElement("label");
    fromLabel.innerHTML = "From: ";
    fromLabel.setAttribute("for", "fromDate");
    fromDiv.appendChild(fromLabel);
    fromDiv.appendChild(fromDateEntry);
    searchDiv.appendChild(fromDiv);

    // setup to date entry
    const toDiv = document.createElement("div");
    toDiv.className = "dateDiv";
    const toDateEntry = document.createElement("input");
    toDateEntry.type = "date";
    toDateEntry.id = "toDate";

    const todayTo = new Date();
    const localToDate =
        todayTo.getFullYear() + "-" +
        String(todayTo.getMonth() + 1).padStart(2, "0") + "-" +
        String(todayTo.getDate()).padStart(2, "0");
    toDateEntry.value = localToDate;
    toDateEntry.className = "input";
    const toLabel = document.createElement("label");
    toLabel.innerHTML = "To: ";
    toLabel.setAttribute("for", "toDate");
    toDiv.appendChild(toLabel);
    toDiv.appendChild(toDateEntry);
    searchDiv.appendChild(toDiv);

    // setup view button
    viewBtn.textContent = "View";
    viewBtn.classList = "saveBtn";
    searchDiv.appendChild(viewBtn);

    // event listener for viewBtn
    viewBtn.addEventListener("click", async () => {
        viewBtn.innerHTML = "Wait...";
        viewBtn.disabled = true;
        const viewData = {
            fromDate: fromDateEntry.value,
            toDate: toDateEntry.value
        }
        if (toDateEntry.value < fromDateEntry.value) {
            alert ("To date cannot be before From date");
            viewBtn.innerHTML = "View";
            viewBtn.disabled = false;
            return;
        };
                    
        // send to backend
        const viewRes = await fetch("/api/viewExpenses", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(viewData)
    });
    const expensesToView = await viewRes.json();
    viewBtn.innerHTML = "View";
    viewBtn.disabled = false;

    displayExpenses(expensesToView);

    });
}

// addNewOption function
function addNewOption() {
    // setup header
    const editHeader = document.createElement("div");
    editHeader.className = "headerText";
    editHeader.innerHTML = "Add New Option";
    editDiv.appendChild(editHeader);

    // add input and save for new category
    const addCategory = document.createElement("input");
    addCategory.type = "text";
    addCategory.placeholder = "Add a category";
    addCategory.className = "input";
    const addCategoryDiv = document.createElement("div");
    addCategoryDiv.appendChild(addCategory);
    const saveCatBtn = document.createElement("button");
    saveCatBtn.textContent = "Save";
    saveCatBtn.classList = "saveBtn";
    addCategoryDiv.appendChild(saveCatBtn);
    editDiv.appendChild(addCategoryDiv);

    // event listener for saveCatBtn
    saveCatBtn.addEventListener("click", async () => {
        saveCatBtn.innerHTML = "Wait...";
        saveCatBtn.disabled = true;
        const categoryData = {
            category: addCategory.value
        }

        // validation
        if (!categoryData.category) {
            alert("Please enter a category.");
            saveCatBtn.disabled = false;
            saveCatBtn.innerHTML = "Save";
            return;
        }

        // send to backend
        const saveRes = await fetch("/api/saveCategory", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(categoryData)
        });
        const result = await saveRes.json();
        // editBtn.click();
        alert("Category saved!");

    });

    // add input and save for new payment type
    const addPaymentType = document.createElement("input");
    addPaymentType.type = "text";
    addPaymentType.placeholder = "Add a payment type";
    addPaymentType.className = "input";
    const addPaymentTypeDiv = document.createElement("div");
    addPaymentTypeDiv.appendChild(addPaymentType);
    const savePayBtn = document.createElement("button");
    savePayBtn.textContent = "Save";
    savePayBtn.classList = "saveBtn";
    addPaymentTypeDiv.appendChild(savePayBtn);
    editDiv.appendChild(addPaymentTypeDiv);

    // event listener for savePayBtn
    savePayBtn.addEventListener("click", async () => {
        savePayBtn.innerHTML = "Wait...";
        savePayBtn.disabled = true;
        const paymentData = {
            payment: addPaymentType.value
        }

        // validation
        if (!paymentData.payment) {
            alert("Please enter a payment type.");
            savePayBtn.disabled = false;
            savePayBtn.innerHTML = "Save";
            return;
        }

        // send to backend
        const saveRes = await fetch("/api/savePaymentType", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(paymentData)
        });
        const result = await saveRes.json();
        alert("Payment type saved!");

    });
}

// displayCategories function
async function displayCategories(categoryDropdown) {
    // get list of categories from database
    const categoryRes = await fetch("/api/getCategories", {
        method: "GET"
    });
    const categoryList = await categoryRes.json();

    // create dropdown with array returned from database
    categoryList.forEach(item => {
        const option = document.createElement("option");
        option.value = item.id;
        option.textContent = item.category;
        categoryDropdown.appendChild(option);
    });
    
} 

// displayPaymentType function
async function displayPaymentTypes(paymentTypeDropdown) {
    // get list of payment types from database
    const paymentRes = await fetch("/api/getPaymentTypes", {
        method: "GET"
    });
    const paymentTypeList = await paymentRes.json();

    // create dropdown with array returned from database
    paymentTypeList.forEach(item => {
        const option = document.createElement("option");
        option.value = item.id;
        option.textContent = item.payment;
        paymentTypeDropdown.appendChild(option);
    });
    
} 

// displayExpenses function
function displayExpenses(expensesToView) {
    displayDiv.innerHTML= "";

    // setup header
    const displayHeader = document.createElement("div");
    displayHeader.className = "headerText";
    displayHeader.innerHTML = "Expenses";
    displayDiv.appendChild(displayHeader);

    const table = document.createElement("table");
    table.className = "expenseTable";
    const headerRow = document.createElement("tr");
    ["Date", "Amount", "Payment"].forEach(text => {
        const th = document.createElement("th");
        th.textContent = text;
        headerRow.appendChild(th);
    });
    table.appendChild(headerRow);

    // each expense info goes into a single table cell
    expensesToView.sort((a, b) => new Date(a.date) - new Date(b.date));
    expensesToView.forEach(expense => {
        const row = document.createElement("tr");
        
        // format amount to have two decimal places
        const formattedAmount = `$${Number(expense.amount).toFixed(2)}`;
        const values = [
            expense.date,
            formattedAmount,
            expense.payment
        ];
         values.forEach((value, index) => {
            const cell = document.createElement("td");
            cell.textContent = value;
            
            // attach listener to date column
            if (index === 0) {
                cell.classList.add("dateLink");

                cell.addEventListener("click", () => {
                    addNewExpense(expense);
                });
        }

            row.appendChild(cell);
        });       
        table.appendChild(row);
    });

    displayDiv.appendChild(table);
}

// main script begins here
const loginModal = document.getElementById("loginModal");
const loginBtn = document.getElementById("loginBtn");
const username = localStorage.getItem("username");
const addDiv = document.getElementById("addDiv");
const searchDiv = document.getElementById("searchDiv");
const displayDiv = document.getElementById("displayDiv");
const editDiv = document.getElementById("editDiv");
const viewBtn = document.createElement("button");


// on page load
window.addEventListener("load", async() => {
    // show login screen if user not logged in
    if(!username) {
        loginModal.style.display = "block";
        return;
    }
    addNewExpense();
    searchExpenses();
    addNewOption();  
});

// on 'login' button click
loginBtn.addEventListener("click", async () => {
    const inputEmail = document.getElementById("inputEmail").value;
    const inputPassword = document.getElementById("inputPassword").value;

    // call the backend js
    const loginRes = await fetch("/api/loginLogic", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({ inputEmail, inputPassword })
    });

    // process the returned data
    const data = await loginRes.json();
    if (!loginRes.ok) {
        document.getElementById("loginError").textContent = data.error;
        return;
    }
    
    // save the date in local storage and reload page
    localStorage.setItem("username", data.user.username);
    localStorage.setItem("userId", data.user.id);
    document.getElementById("loginModal").style.display = "none";
    location.reload();
});





    