# JavaScript — Phase 1 & 2 🚀

A hands-on learning repo for **JavaScript fundamentals** (Phase 1 & 2) built while
studying full-stack web development at **Apna College (Sigma Batch 12)**.
Every concept is explored through small, focused, well-commented `.js` files
that you can run directly in the browser or with Node.js.

## 📖 Overview

This folder collects the JavaScript practice work done during the course —
from arithmetic operators and comparison statements to conditionals, logical
operators, truthy/falsy values, switch statements, alerts and prompts.
Each topic lives in its own numbered folder so you can jump straight to the
concept you want to revise.

## 🛠️ Tech Stack

- **JavaScript (ES6+)** — core language features
- **HTML5** — `index.html` entry point
- **CSS3 / Bootstrap 5** — light styling for the demo page
- No build step, no dependencies, no frameworks

## 📂 Project Structure

```text
03 JavaScript/
├── index.html                              # Demo entry point (loads a JS file)
├── style.css                               # Custom styles (currently empty)
└── 01 JavaScript phase 1 and 2/
    ├── 00 Basics/
    │   └── app.js                          # Arithmetic, assignment, comparison operators
    ├── 01 Comparision Statements/
    │   ├── comparision operators.js        # > >= < <= == != and typeof
    │   └── com_for_char.js                 # Comparing characters (ASCII order)
    ├── 02 Conditional Statements/
    │   ├── _01_if_else.js                  # Simple if
    │   ├── _02_else_if.js                  # else if ladder (grading, traffic light)
    │   ├── _03_practice_question.js        # T-shirt size → price
    │   ├── _04_else.js                     # if / else voting check
    │   └── _05_nested_if.js                # Nested if (pass + grade)
    ├── 03 Practice problems/
    │   └── _01_if_practice.js              # Traffic-light color logic
    ├── 04 Logical operators/
    │   ├── _logical_and.js                 # && truth table + pass/grade
    │   ├── _logical_or_opr.js              # || truth table + pass/grade
    │   ├── _logical_not.js                 # ! (NOT) operator
    │   ├── _practice_01.js                 # "Good string" check
    │   └── _practice_02.js                  # Compound condition prediction
    ├── 05 Truthy and falsey value/
    │   └── _01_truthy_and_falsy.js         # "" vs " " truthiness
    ├── 06 Swtich statement/
    │   ├── _01_switch.js                   # Traffic-light switch
    │   └── _02_practice.js                 # Day number → weekday name
    └── 07 Alerts and prompts/
        ├── _1_alert.js                     # alert / console.log / error / warn
        └── _2_prompt.js                    # prompt + alert welcome message
```

## 🧠 Concepts Covered

### 00 · Basics
- Arithmetic operators (`+ - * / % **`)
- Assignment operator (`=`)
- Comparison operators returning booleans (`> >= < <= == !=`)

### 01 · Comparison Statements
- Relational & equality comparison
- `typeof` operator
- Character comparison using ASCII/Unicode code points

### 02 · Conditional Statements
- `if`, `else`, `else if` ladders
- Nested `if` statements
- Real-world examples: grading system, traffic light, voting eligibility, pricing by size

### 03 · Practice Problems
- Conditional logic exercises (traffic-light colors)

### 04 · Logical Operators
- `&&` (AND), `||` (OR), `!` (NOT) with truth tables
- Compound conditions combining multiple checks
- Practice: "good string" validation, output prediction

### 05 · Truthy & Falsy Values
- Falsy values (`""`, `0`, `null`, `undefined`, `NaN`, `false`)
- Truthy values (non-empty strings, non-zero numbers, etc.)

### 06 · Switch Statement
- `switch` / `case` / `break` / `default`
- Multi-case matching (day number → weekday)

### 07 · Alerts & Prompts
- `alert()`, `prompt()`, `console.log()`, `console.error()`, `console.warn()`
- Template literals for dynamic messages

## ▶️ How to Run

### In the browser
1. Open `index.html` in any modern browser.
2. The page currently loads `01 JavaScript phase 1 and 2/07 Alerts and prompts/_2_prompt.js`,
   which prompts for your first and last name and shows a welcome alert.
3. To try a different concept, edit the `<script src="...">` tag in `index.html`
   to point at any other `.js` file, then refresh.

> Tip: open DevTools (`F12` → Console) to see `console.log` output.

### With Node.js
```bash
cd "01 JavaScript phase 1 and 2/00 Basics"
node app.js
```
Any file can be run the same way:
```bash
node "01 JavaScript phase 1 and 2/06 Swtich statement/_02_practice.js"
```

## 🎯 Learning Goals

- Understand JavaScript operators, control flow and type coercion
- Practice writing clean, readable conditional logic
- Get comfortable with the browser console, alerts and prompts
- Build a habit of small, focused experiments per concept

## ✍️ Author

**Shubham Maurya** — Full Stack Web Development (Apna College, Sigma Batch 12)

## 📄 License

Open source, for educational purposes. Feel free to fork and experiment.
