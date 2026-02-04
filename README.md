# CRM Frontend (React + Tailwind)

This is the **frontend application** for the CRM system, built using **plain React**, **Tailwind CSS**, and **React Router**.  
It consumes the CRM backend API and provides UI for managing leads, contacts, notes, tasks, and timelines.

---

## Tech Stack

- React (Vite)
- React Router DOM
- Tailwind CSS
- Fetch API
- JWT-based authentication

---

## Features

### 🔐 Authentication
- Login
- Signup
- JWT token storage
- Protected routes
- Auto redirect on auth state

---

### 🎯 Leads
- List leads
- Search & filter leads
- Create lead
- Update lead status
- Convert lead → contact

---

### 📇 Contacts
- List contacts
- View contact details
- Edit contact info
- Owner-based access
- Contact-scoped data

---

### 📝 Notes
- Add notes to contact
- Edit notes
- Delete notes
- Notes appear inside contact details

---

### ✅ Tasks
- Create tasks linked to contacts
- Mark tasks complete / pending
- Due date support
- View pending tasks

---

### 🕒 Timeline
- Timeline per contact
- Merged view of:
  - Notes
  - Tasks
- Ordered by time

---

### 🧱 Layout
- App shell with navigation
- Protected pages
- Responsive UI
- Clean Tailwind-based design

---

## 🚧 Admin Dashboard (TODO)

The **Admin Dashboard** is planned but **not implemented yet**.

### Planned Admin Features
- List all users
- View user roles
- Manage users (future)
- System-level overview

> Admin users currently authenticate successfully but do not yet have a dedicated dashboard UI.

---

## Project Structure

```text
src/
├── api/
│   └── client.js
├── auth/
│   ├── AuthContext.jsx
│   └── ProtectedRoute.jsx
├── components/
│   ├── AppShell.jsx
│   ├── Button.jsx
│   └── Input.jsx
├── pages/
│   ├── Login.jsx
│   ├── Signup.jsx
│   ├── Leads.jsx
│   ├── Contacts.jsx
│   └── ContactDetails.jsx
├── App.jsx
├── main.jsx
└── index.css
