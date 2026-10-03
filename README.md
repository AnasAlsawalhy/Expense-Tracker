# Expense Tracker

This is a responsive, full-stack web application built with HTML, CSS (Bootstrap), JavaScript, Node.js, and PostgreSQL.
It allows users to efficiently manage their daily financial expenses, categorize them, and view real-time summary statistics.

## How to run

**Backend**

1. Open PostgreSQL using pgAdmin4 and create a new database `expense_tracker`.
2. Run the SQL script provided in `schema.sql` inside your database to create the necessary tables.
3. Open the backend folder in VS Code.
4. Create a `.env` file in the root directory of your backend and add your database credentials (`DB_USER`, `DB_PASSWORD`, `DB_NAME`, `DB_PORT`, `PORT=3000`).
5. Open the terminal in VS Code and run `npm install` to install all required packages.
6. Run `node server.js` to start the backend server.

**Frontend**

1. Open the frontend folder in VS Code.
2. Open the `index.html` file using the "Live Server" extension, or simply double-click the file to open it directly in your web browser.

## Features

- [✔️] Add an expense (with validation)
- [✔️] Delete an expense
- [✔️] Edit an expense
- [✔️] Filter by category
- [✔️] Summary cards (total, count, highest)
- [✔️] Data is saved in a PostgreSQL database

## Screenshots and recorde :https://drive.google.com/drive/folders/10WKIqIzNuf-OJs1pMUZZbiPDYIeS85sw?usp=sharing

## GitHub Repository:https://github.com/AnasAlsawalhy/Expense-Tracker

## What was the hardest part?

The hardest part of this project was connecting the frontend's Bootstrap Modal for editing records with the backend's PUT request, specifically ensuring that the correct expense ID was captured and passed seamlessly without causing DOM binding errors. I solved this by adding a hidden <input> field inside the edit form. When the "Edit" button is clicked, a JavaScript function extracts the expense details from the specific table row, populates the modal's fields, and temporarily stores the ID in the hidden input. This made it easily accessible when the form is submitted via the Fetch API.
