// --- DOM Elements ---
const balance = document.getElementById('balance');
const incomeDisplay = document.getElementById('income');
const expenseDisplay = document.getElementById('expense');
const list = document.getElementById('list');
const form = document.getElementById('form');
const text = document.getElementById('text');
const amount = document.getElementById('amount');
const type = document.getElementById('type');
const submitBtn = document.getElementById('submit-btn');

// --- Global Variables ---
// Retrieve data from LocalStorage. If empty, initialize as an empty array.
let transactions = JSON.parse(localStorage.getItem('transactions')) || [];
let isEditing = false;
let editID = null;

// --- Functions ---

// 1. UPDATE DOM: Calculate and display Income, Expense, and Balance using filter() and reduce()
function updateValues() {
    // Calculate Total Income
    const income = transactions
        .filter(transaction => transaction.type === 'income')
        .reduce((acc, transaction) => acc + transaction.amount, 0);

    // Calculate Total Expense
    const expense = transactions
        .filter(transaction => transaction.type === 'expense')
        .reduce((acc, transaction) => acc + transaction.amount, 0);

    // Calculate Total Balance
    const total = income - expense;

    // Update UI
    balance.innerText = `₹${total.toFixed(2)}`;
    incomeDisplay.innerText = `₹${income.toFixed(2)}`;
    expenseDisplay.innerText = `₹${expense.toFixed(2)}`;
}

// 2. READ: Render all transactions to the UI
function renderTransactions() {
    // Clear list first
    list.innerHTML = '';

    // Loop through the array and create HTML elements
    transactions.forEach(transaction => {
        // Determine CSS class and operator based on type
        const cssClass = transaction.type === 'income' ? 'border-left-success' : 'border-left-danger';
        const operator = transaction.type === 'income' ? '+' : '-';

        // Create the list item element
        const li = document.createElement('li');
        li.classList.add('transaction-item', cssClass);

        // Inject inner HTML
        li.innerHTML = `
            <div>
                <strong>${transaction.text}</strong> 
                <br>
                <small class="text-muted">${transaction.type}</small>
            </div>
            <div class="d-flex align-items-center">
                <span class="fw-bold me-3">₹${transaction.amount.toFixed(2)}</span>
                <button class="action-btn edit-btn" onclick="editTransaction(${transaction.id})"><i class="bi bi-pencil-square"></i></button>
                <button class="action-btn delete-btn" onclick="deleteTransaction(${transaction.id})"><i class="bi bi-trash"></i></button>
            </div>
        `;

        // Append to the list
        list.appendChild(li);
    });
}

// 3. CREATE & UPDATE: Handle Form Submission
function handleFormSubmit(e) {
    e.preventDefault(); // Prevent page reload

    // Validate inputs
    if (text.value.trim() === '' || amount.value.trim() === '') {
        alert('Please add a text and amount');
        return;
    }

    const transaction = {
        id: isEditing ? editID : generateID(), // Use existing ID if editing, otherwise generate new
        text: text.value,
        amount: +amount.value, // The '+' converts string to number
        type: type.value
    };

    if (isEditing) {
        // Update Transaction (Find index and replace)
        const index = transactions.findIndex(t => t.id === editID);
        transactions[index] = transaction;
        
        // Reset Editing State
        isEditing = false;
        editID = null;
        submitBtn.innerText = 'Add Transaction';
    } else {
        // Create Transaction (Add to array)
        transactions.push(transaction);
    }

    // Update LocalStorage and DOM
    updateLocalStorage();
    init();

    // Clear form inputs
    text.value = '';
    amount.value = '';
}

// 4. DELETE: Remove transaction by ID using filter()
function deleteTransaction(id) {
    // Return a new array with all elements EXCEPT the one with the matching ID
    transactions = transactions.filter(transaction => transaction.id !== id);
    
    updateLocalStorage();
    init();
}

// 5. EDIT Preparation: Populate form with existing data
function editTransaction(id) {
    // Find the specific transaction
    const transaction = transactions.find(t => t.id === id);
    
    // Populate form
    text.value = transaction.text;
    amount.value = transaction.amount;
    type.value = transaction.type;

    // Set UI to Edit Mode
    isEditing = true;
    editID = id;
    submitBtn.innerText = 'Update Transaction';
}

// Utility: Generate Random ID
function generateID() {
    return Math.floor(Math.random() * 100000000);
}

// Utility: Save array to LocalStorage
function updateLocalStorage() {
    // LocalStorage only stores strings, so we must stringify our JS array
    localStorage.setItem('transactions', JSON.stringify(transactions));
}

// Initialization function
function init() {
    renderTransactions();
    updateValues();
}

// --- Event Listeners ---
form.addEventListener('submit', handleFormSubmit);

// Start the app
init();