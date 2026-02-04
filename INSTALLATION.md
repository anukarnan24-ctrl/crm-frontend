
# Frontend Installation Guide

This document explains how to install, configure, and run the **CRM Frontend** locally.


## Prerequisites

Make sure you have the following installed:

- Node.js v20 or later
- npm or yarn
- CRM Backend running
- Git

---

## 1. Clone the Repository

```bash
git clone <frontend-repository-url>
cd crm-frontend
```

## 2. Install Dependencies

```bash
npm install
```
## 3. Enviroment Setup

create .env file in project root and add this env values

```bash
VITE_API_BASE=http://localhost:4000
```

## 4. Start Development Server

```bash
npm run dev
```
## 5. Build for production

```bash
npm run build
```
This will generate a production-ready build in the dist/ folder.




