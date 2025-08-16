# Finance Tracker

A simple web application for analyzing financial CSV data using Flask and pandas.

## Description

Upload CSV files containing financial transactions and get automatic analysis including:
- Category-wise expense distribution
- Credit/Debit summaries  
- Net balance calculation

Built as a learning project to practice pandas data manipulation in a web context.

## Tech Stack

- **Backend**: Flask
- **Data Processing**: Pandas
- **Frontend**: HTML, JavaScript, Tailwind CSS

## Setup & Run

### Prerequisites
- Python 3.8+
- [UV package manager](https://github.com/astral-sh/uv)

### Installation
```bash
# Clone and navigate to project
git clone <repo-url>
cd finance-tracker

# Setup with UV
uv venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
uv add flask pandas

# Run the app
uv run python app.py
```

Visit `http://localhost:3030`

## CSV Format

Your CSV should have these columns:
```csv
Date,Description,Category,Amount,Type
2024-01-15,Groceries,Food,-85.50,Debit
2024-01-16,Salary,Income,3000.00,Credit
```

## Features

- Upload and manage CSV files
- Automatic financial statistics computation
- Category distribution analysis
- Real-time balance tracking
- Clean, responsive interface
