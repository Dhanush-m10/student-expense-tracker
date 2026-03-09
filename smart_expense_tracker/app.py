from flask import Flask, render_template, request, jsonify
import sqlite3
import os
from datetime import datetime

app = Flask(__name__)
DB_FILE = 'expense_tracker.db'

def init_db():
    conn = sqlite3.connect(DB_FILE)
    c = conn.cursor()
    c.execute('''
        CREATE TABLE IF NOT EXISTS expenses (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            amount REAL NOT NULL,
            category TEXT NOT NULL,
            date TEXT NOT NULL
        )
    ''')
    conn.commit()
    conn.close()

def get_db_connection():
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    return conn

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/expenses', methods=['GET'])
def get_expenses():
    conn = get_db_connection()
    expenses = conn.execute('SELECT * FROM expenses ORDER BY date DESC').fetchall()
    conn.close()
    
    expenses_list = []
    for row in expenses:
        expenses_list.append({
            'id': row['id'],
            'name': row['name'],
            'amount': row['amount'],
            'category': row['category'],
            'date': row['date']
        })
    return jsonify(expenses_list)

@app.route('/api/expenses', methods=['POST'])
def add_expense():
    data = request.json
    name = data.get('name')
    amount = data.get('amount')
    category = data.get('category')
    date = data.get('date')
    
    if not all([name, amount, category, date]):
        return jsonify({'error': 'Missing required fields'}), 400
        
    try:
        amount = float(amount)
    except ValueError:
        return jsonify({'error': 'Amount must be a number'}), 400
        
    conn = get_db_connection()
    c = conn.cursor()
    c.execute('INSERT INTO expenses (name, amount, category, date) VALUES (?, ?, ?, ?)',
              (name, amount, category, date))
    conn.commit()
    expense_id = c.lastrowid
    conn.close()
    
    return jsonify({
        'id': expense_id,
        'name': name,
        'amount': amount,
        'category': category,
        'date': date
    }), 201

@app.route('/api/expenses/<int:id>', methods=['DELETE'])
def delete_expense(id):
    conn = get_db_connection()
    c = conn.cursor()
    c.execute('DELETE FROM expenses WHERE id = ?', (id,))
    conn.commit()
    deleted = c.rowcount > 0
    conn.close()
    
    if deleted:
        return jsonify({'success': True}), 200
    else:
        return jsonify({'error': 'Expense not found'}), 404

if __name__ == '__main__':
    init_db()
    app.run(debug=True)
