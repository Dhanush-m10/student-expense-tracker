💰 Smart Student Expense Tracker

A simple and intuitive web application for college students to track daily expenses, monitor their monthly budget, and visualize spending patterns through an interactive dashboard.

The application allows users to log expenses, categorize spending, and analyze financial behavior, helping students manage their money more effectively.

📌 Project Overview

The Smart Student Expense Tracker is designed specifically for students who want a lightweight and easy way to manage their daily spending.

Users can:

Record expenses quickly

View all transactions in a structured table

Monitor their monthly budget usage

Analyze spending categories visually

The system also provides automatic warnings when the monthly budget limit is exceeded, helping users maintain financial discipline.

🚀 Features
1️⃣ Expense Logging

Users can add new expenses through an interactive modal form.

Required inputs:

Expense Name

Amount

Date

Category

2️⃣ Expense Listing

All recorded expenses are displayed in a clean and structured table.

Transactions are sorted by most recent first.

Users can delete expenses instantly.

3️⃣ Dashboard Statistics

The dashboard automatically calculates:

Total Amount Spent

Remaining Budget (from default $500)

Top Spending Category

All calculations update dynamically.

4️⃣ Visual Analytics

The application integrates Chart.js to display a Doughnut Chart showing spending distribution across categories:

Food 🍔

Travel ✈️

Shopping 🛍️

Entertainment 🎮

Education 📚

Other 📦

This helps users quickly understand where their money is going.

5️⃣ Budget Warnings

The tracker constantly monitors total expenses against the defined monthly budget.

⚠️ If spending exceeds the $500 limit, the system immediately displays a warning alert to notify the user.

🏗 Architecture & Technologies
Backend

Python 3

Flask Framework

Responsibilities:

Handles RESTful API endpoints

Processes HTTP methods (GET, POST, DELETE)

Communicates with the database

Database

SQLite

Reasons for using SQLite:

Lightweight

Self-contained

No external configuration needed

Database file automatically created:

expense_tracker.db
Frontend
HTML

Built using Flask Jinja2 templates

Styling

Custom CSS (No frameworks)

Techniques used:

CSS Variables

Flexbox

CSS Grid

Responsive layout

Soft shadows and hover animations

JavaScript

The frontend uses Vanilla JavaScript for:

Fetching data from the Flask backend

Updating the UI dynamically

Managing DOM updates

Rendering charts using Chart.js

All communication with the backend is done using the Fetch API.

📂 Project Structure
Smart-Student-Expense-Tracker
│
├── app.py
├── requirements.txt
├── README.md
│
├── templates
│   └── index.html
│
└── static
    ├── css
    │   └── style.css
    │
    └── js
        └── main.js
