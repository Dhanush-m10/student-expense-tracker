// Configuration
const MONTHLY_BUDGET = 500.00;
let expenses = [];
let categoryChart = null;

// Category colors for chart and UI
const categoryColors = {
    'Food': '#f97316', // Orange
    'Travel': '#3b82f6', // Blue
    'Shopping': '#ec4899', // Pink
    'Entertainment': '#8b5cf6', // Purple
    'Education': '#10b981', // Emerald
    'Other': '#6b7280' // Gray
};

const categoryEmojis = {
    'Food': '🍽️',
    'Travel': '🚗',
    'Shopping': '🛍️',
    'Entertainment': '🎬',
    'Education': '📚',
    'Other': '✨'
};

// DOM Elements
document.addEventListener('DOMContentLoaded', () => {
    // Set today's date as default in form
    document.getElementById('date').valueAsDate = new Date();
    
    // Set budget display
    document.getElementById('budget-limit-display').textContent = MONTHLY_BUDGET.toFixed(2);
    
    // Load data
    fetchExpenses();
    
    // Setup form submit handler
    document.getElementById('expense-form').addEventListener('submit', handleAddExpense);
});

// Modal toggle
function toggleExpenseModal() {
    const modal = document.getElementById('expense-modal');
    if (modal.classList.contains('hidden')) {
        modal.classList.remove('hidden');
        // Reset form
        document.getElementById('expense-form').reset();
        document.getElementById('date').valueAsDate = new Date();
    } else {
        modal.classList.add('hidden');
    }
}

// Fetch expenses from API
async function fetchExpenses() {
    try {
        const response = await fetch('/api/expenses');
        if (!response.ok) throw new Error('Failed to fetch expenses');
        
        expenses = await response.json();
        updateDashboard();
    } catch (error) {
        console.error('Error fetching expenses:', error);
        // Fallback for UI if backend is not ready
    }
}

// Add new expense via API
async function handleAddExpense(e) {
    e.preventDefault();
    
    const name = document.getElementById('name').value;
    const amount = parseFloat(document.getElementById('amount').value);
    const date = document.getElementById('date').value;
    const category = document.getElementById('category').value;
    
    const expenseData = { name, amount, date, category };
    
    try {
        const response = await fetch('/api/expenses', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(expenseData)
        });
        
        if (!response.ok) throw new Error('Failed to add expense');
        
        const newExpense = await response.json();
        
        // Add to local state and re-render
        expenses.unshift(newExpense); // Add to beginning of array
        
        // Sort expenses by date (newest first)
        expenses.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        updateDashboard();
        toggleExpenseModal();
    } catch (error) {
        console.error('Error adding expense:', error);
        alert('Failed to add expense. Please try again.');
    }
}

// Delete expense via API
async function deleteExpense(id) {
    if (!confirm('Are you sure you want to delete this expense?')) return;
    
    try {
        const response = await fetch(`/api/expenses/${id}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) throw new Error('Failed to delete expense');
        
        // Remove from local state and re-render
        expenses = expenses.filter(exp => exp.id !== id);
        updateDashboard();
    } catch (error) {
        console.error('Error deleting expense:', error);
        alert('Failed to delete expense. Please try again.');
    }
}

// Update all dashboard elements
function updateDashboard() {
    renderExpensesList();
    updateStats();
    renderChart();
    checkBudget();
}

// Render expenses table
function renderExpensesList() {
    const listContainer = document.getElementById('expenses-list');
    const emptyState = document.getElementById('empty-state');
    
    listContainer.innerHTML = '';
    
    if (expenses.length === 0) {
        emptyState.classList.remove('hidden');
        return;
    }
    
    emptyState.classList.add('hidden');
    
    expenses.forEach(expense => {
        const row = document.createElement('tr');
        
        // Format date
        const dateObj = new Date(expense.date);
        const dateStr = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        
        const emoji = categoryEmojis[expense.category] || categoryEmojis['Other'];
        
        row.innerHTML = `
            <td>${dateStr}</td>
            <td style="font-weight: 500; color: var(--text-main);">${expense.name}</td>
            <td>
                <span class="category-badge">
                    ${emoji} ${expense.category}
                </span>
            </td>
            <td class="amount">$${parseFloat(expense.amount).toFixed(2)}</td>
            <td>
                <button class="btn-danger-sm" onclick="deleteExpense(${expense.id})" title="Delete">
                    <i class="fa-solid fa-trash-can"></i>
                </button>
            </td>
        `;
        listContainer.appendChild(row);
    });
}

// Calculate and update stats
function updateStats() {
    const totalSpent = expenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);
    const remaining = MONTHLY_BUDGET - totalSpent;
    
    // Update elements
    document.getElementById('total-spending').textContent = `$${totalSpent.toFixed(2)}`;
    
    const remainingEl = document.getElementById('remaining-budget');
    remainingEl.textContent = `$${Math.max(0, remaining).toFixed(2)}`;
    
    // Change color of remaining budget based on status
    if (remaining < 0) {
        remainingEl.style.color = 'var(--danger)';
    } else if (remaining < MONTHLY_BUDGET * 0.2) {
        // Less than 20% remaining
        remainingEl.style.color = 'var(--warning)';
    } else {
        remainingEl.style.color = 'var(--text-main)';
    }
    
    // Calculate top category
    if (expenses.length > 0) {
        const categoryTotals = {};
        expenses.forEach(exp => {
            if (!categoryTotals[exp.category]) categoryTotals[exp.category] = 0;
            categoryTotals[exp.category] += parseFloat(exp.amount);
        });
        
        let topCategory = '';
        let maxAmount = 0;
        
        for (const [cat, amt] of Object.entries(categoryTotals)) {
            if (amt > maxAmount) {
                maxAmount = amt;
                topCategory = cat;
            }
        }
        
        document.getElementById('top-category').textContent = topCategory;
        document.getElementById('top-category-amount').textContent = `$${maxAmount.toFixed(2)} spent`;
        document.getElementById('top-category-amount').className = 'trend text-muted';
    } else {
        document.getElementById('top-category').textContent = '-';
        document.getElementById('top-category-amount').textContent = '$0.00 spent';
    }
}

// Show/hide budget warning
function checkBudget() {
    const totalSpent = expenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);
    const warningEl = document.getElementById('budget-warning');
    
    if (totalSpent > MONTHLY_BUDGET) {
        warningEl.classList.remove('hidden');
    } else {
        warningEl.classList.add('hidden');
    }
}

// Render or update Chart.js Pie Chart
function renderChart() {
    const ctx = document.getElementById('categoryChart').getContext('2d');
    
    // Aggregate data by category
    const categoryTotals = {};
    expenses.forEach(exp => {
        if (!categoryTotals[exp.category]) categoryTotals[exp.category] = 0;
        categoryTotals[exp.category] += parseFloat(exp.amount);
    });
    
    const labels = Object.keys(categoryTotals);
    const data = Object.values(categoryTotals);
    
    // Default data if no expenses
    const chartLabels = labels.length > 0 ? labels : ['No Expenses'];
    const chartData = data.length > 0 ? data : [1];
    const chartColors = labels.length > 0 
        ? labels.map(label => categoryColors[label] || categoryColors['Other']) 
        : ['#e5e7eb']; // Gray for empty state
    
    // Destroy previous chart instance if it exists
    if (categoryChart) {
        categoryChart.destroy();
    }
    
    // Create new chart
    categoryChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: chartLabels,
            datasets: [{
                data: chartData,
                backgroundColor: chartColors,
                borderWidth: 0,
                hoverOffset: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        usePointStyle: true,
                        padding: 20,
                        font: {
                            family: "'Inter', sans-serif",
                            size: 12
                        }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            if (labels.length === 0) return ' No expenses yet';
                            let label = context.label || '';
                            if (label) {
                                label += ': ';
                            }
                            if (context.parsed !== null) {
                                label += new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(context.parsed);
                            }
                            return label;
                        }
                    }
                }
            },
            cutout: '70%'
        }
    });
}
