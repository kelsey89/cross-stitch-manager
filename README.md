# Cross-Stitch Project & Thread Management System

A web application for hobbyists and professionals to track DMC thread collections, plan cross-stitch projects, and assign threads to projects. Built with React, Node.js/Express, SQLite, and secured per-user with JSON Web Tokens.

---

## Features

- **User Authentication**: Register & login with username/password.
- **Thread Inventory**: Add, edit, delete threads. Mark owned/unowned.
- **Project Management**: Create, view, update, and delete projects.
- **Assignment**: Link threads to specific projects.
- **Export/Import**: Download your thread list as CSV; bulk-import JSON or CSV.
- **Responsive UI**: Powered by React-Bootstrap.
- **Automated Tests**: 
  - **Backend**: Jest + Supertest integration tests.
  - **Frontend**: React Testing Library unit tests.

---

## Table of Contents

1. [Prerequisites](#prerequisites)  
2. [Quick Start](#quick-start)  
3. [Environment](#environment)  
4. [Running Locally](#running-locally)  
5. [Running Tests](#running-tests)  
6. [API Endpoints](#api-endpoints)  
7. [Folder Structure](#folder-structure)  
8. [Deployment](#deployment)  
9. [License](#license)

---

## Prerequisites

- [Node.js](https://nodejs.org/) >= 16.x  
- npm (comes with Node.js)  
- (Optional) [Git](https://git-scm.com/) for cloning  

---

## Quick Start

```bash
# Clone the repo
git clone <your-repo-url>
cd cross-stitch-manager

# Start backend
cd server
npm install
npm start

# In a new tab, start frontend
cd ../client
npm install
npm start
