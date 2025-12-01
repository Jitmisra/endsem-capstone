Frontend https://endsem-capstone.vercel.app/
Backend https://endsem-capstone-i3w7.onrender.com


📚 EduStore – NCERT Books & Notes Management System

1. Problem Statement
Students from Class 1 to Class 12 struggle to find reliable NCERT textbooks, concise notes, and solutions in a single place. Most available resources online are scattered, unverified, or lack structure.
 EduStore aims to build a centralized educational platform where students can easily browse NCERT books, organized notes, and reference PDFs—while administrators can upload, edit, and manage content from a dedicated dashboard.

2. System Architecture
Frontend → Backend (API Layer) → Database
Frontend:
 Built using React.js with React Router for page navigation and Axios for API requests. The user interface will include both student and admin views, designed with TailwindCSS for a responsive and minimal experience.


Backend:
 Developed using Node.js and Express.js. It handles authentication, CRUD operations, and serves RESTful APIs. The backend uses Prisma ORM to manage SQL database operations efficiently.


Database:
 PostgreSQL hosted on Neon / Railway, structured with clear relations between Users, Books, Notes, and Subjects. Prisma migrations ensure smooth schema evolution.


Authentication:
 JWT-based authentication with role-based access control (Admin / Student). Passwords will be securely hashed with bcrypt.


Hosting:


Frontend: Vercel


Backend: Render or Railway


Database: Neon / Railway PostgreSQL



3. Key Features
Category
Description
Authentication & Authorization
JWT-based login/signup with role distinction for Admins and Students.
Admin Panel
Admins can upload, edit, or delete NCERT books and PDF notes. Includes file upload with Cloudinary integration.
Student Interface
Students can browse, search, and view books and notes by class and subject.
CRUD Operations
Full CRUD (Create, Read, Update, Delete) functionality for managing books, subjects, and notes.
Search, Filter & Pagination
Search by class, subject, or topic; paginate large lists for performance.
Dynamic Data Fetching
All content dynamically fetched from backend APIs using Axios.
Responsive UI
TailwindCSS ensures smooth experience on mobile, tablet, and desktop.
Hosting
Fully deployed and accessible frontend, backend, and database.

4. Tech Stack
Layer
Technologies
Frontend
React.js, React Router, Axios, TailwindCSS
Backend
Node.js, Express.js, Prisma ORM
Database
PostgreSQL (SQL)
Authentication
JWT, bcrypt
File Storage
Cloudinary (for PDFs and notes)
Hosting
Vercel (frontend), Render/Railway (backend), Neon (database)


5. Database Schema (Conceptual)
Tables:
User: id, name, email, passwordHash, role (admin/student)


Book: id, title, subject, class, pdfUrl, createdAt, updatedAt


Note: id, title, subject, class, pdfUrl, createdAt, updatedAt, bookId (FK)


Subject: id, name, class


Relationships:
One Subject → Many Books


One Book → Many Notes


One Admin → Can manage many Books/Notes



6. API Overview
Endpoint
Method
Description
Access
/api/auth/signup
POST
Register user
Public
/api/auth/login
POST
Authenticate & return JWT
Public
/api/books
GET
Fetch all books with pagination & filters
Authenticated
/api/books/:id
GET
Fetch single book details
Authenticated
/api/books
POST
Upload new book with PDF (Admin Panel)
Admin
/api/books/:id
PUT
Edit book details
Admin
/api/books/:id
DELETE
Remove book
Admin
/api/notes
GET
Fetch notes by class/subject
Authenticated
/api/notes
POST
Upload new note (PDF)
Admin
/api/notes/:id
PUT
Update note info
Admin
/api/notes/:id
DELETE
Delete note
Admin

7. Expected Outcome
EduStore will be a complete full-stack educational platform featuring:
Student Dashboard to access NCERT books, notes, and solutions with advanced search and filtering.


Admin Panel for uploading, managing, and organizing content dynamically.


Fully hosted and production-ready architecture with secure SQL database and Prisma ORM integration.


This project demonstrates complete mastery over frontend and backend integration, database modeling with Prisma, authentication, and real-world deployment workflows.
