# Online Student Management System

A state-of-the-art web-based **Student Management System** designed to digitize administrative workflows for schools, colleges, and educational training centers. Built using JavaScript only (NO TypeScript) utilizing a modern MVC architecture for the Node.js/Express backend, Mongoose ODM schemas, and an interactive React.js single-page application dashboard.

---

## 🚀 Key Architectural highlights
- **Complete MVC Architecture**: Express backend split into controllers, schemas, route handlers, and verification middlewares.
- **Dynamic Role-Based Authorization Checkers**: Enforces security protocols so Students can only audit personal profiles/grades, Teachers can record scores and attendance, and Administrators hold total administrative control.
- **RESTful Endpoints & Validation**: Fully developed schemas and try/catch handlers for validating duplicates and malformed parameters.
- **Interactive, Accessible UI**: High-fidelity dashboard designs, custom search criteria, pages, overlays, and responsive sidebars.

---

## 📁 System Folder Structure
```
student-management-system/
├── backend/
│   ├── config/          # Databases configuration (Mongoose)
│   ├── controllers/     # MVC controller routers (User, Pupil, Courses, Records)
│   ├── middleware/      # Error routing and JWT session checks
│   ├── models/          # Structured Mongoose databases schemas
│   ├── routes/          # RESTful routing endpoints
│   ├── seeders/         # Seed files to populate tables
│   ├── utils/           # JWT creation utility
│   ├── uploads/         # Student avatars uploads (multer compatibility)
│   ├── .env             # Server variables
│   ├── package.json     # Node script definitions
│   └── server.js        # Express main server entry-point
│
├── frontend/
│   ├── src/
│   │   ├── components/  # Navigations, tables, indicators
│   │   ├── context/     # Global auth states
│   │   ├── pages/       # Login, Dashboard, Grade grids
│   │   ├── services/    # Unified Axios API connectors
│   │   ├── index.css    # Tailwind base styling
│   │   ├── App.jsx      # React router core
│   │   └── main.jsx     # Vite mounts
│   ├── public/
│   ├── vite.config.js   # Proxy definitions
│   └── package.json     # Client packages
│
└── README.md            # Installation steps & instruction docs
```

---

## ⚙️ Requirements & Technical Prerequisites
Before running the system, ensure you have:
1. **Node.js** (v18.x or above recommended)
2. **MongoDB Community Server** (running locally on port `27017` or a Mongo Atlas server string)
3. **NPM** (Node Package Manager)

---

## 📦 Setting Up and Starting the Project

### Step 1: Clone or Extract the Archives
Ensure all project contents are extracted into a local directory containing the `backend` and `frontend` folders.

### Step 2: Configure Environment Variables (.env)
Check the `.env` template inside the `backend` directory. Adjust any ports or secret keys if necessary:
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/student_management_system
JWT_SECRET=student_mgt_secret_key_12345
NODE_ENV=development
```

---

### Step 3: Run the Backend Server
Open a terminal in the root directories and execute:
```bash
cd backend

# Install project dependencies
npm install

# Run database seed records
npm run seed

# Start server in Hot-Reload Development mode
npm run dev
```

> **Note**: Running `npm run seed` will wipe any existing database entries and automatically populate standard courses, teachers, registration indices, and default logins!

---

### Step 4: Run the Frontend Client
In a new, separate terminal window, execute:
```bash
cd frontend

# Install client dependencies
npm install

# Start Vite hot-reload server
npm run dev
```

Open your browser to the URL displayed in your terminal (usually `http://localhost:3000`).

---

## 🔒 Default Login Credentials (Seeded Accounts)

For fast testing and validation, the seeding script populates three different user roles with specific access levels:

### 💼 1. Admin Account (Full Permissions)
- **Email**: `admin@example.com`
- **Password**: `admin123`
- **Permissions**: Add/Edit/Delete teachers and courses, enroll students, audit attendance records and final marks.

### 🎓 2. Teacher Account (Medium Permissions)
- **Email**: `teacher@example.com`
- **Password**: `teacher123`
- **Permissions**: Browse assigned courses, take daily class attendance sheets, log midterm/final scorecards for students.

### 👤 3. Student Account (Read-Only Portal)
- **Email**: `student@example.com`
- **Password**: `student123`
- **Permissions**: Browse enrolled classes, view personal historical check-in statistics, download/print unified transcript cards.

---

## 📡 REST API Routes Catalog

### 🔑 Authentication Routes
- `POST /api/auth/register` - Create account (supports student/teacher sub-profiles).
- `POST /api/auth/login` - Authenticate account and retrieve JWT code.
- `GET /api/auth/me` - Read session variables (Authorized).

### 👥 Students directory
- `GET /api/students` - Query students list (Admin & Teacher only. Supports pagination + search).
- `POST /api/students` - Instantiate student registration and login creation (Admin only).
- `PUT /api/students/:id` - Modify student profile indices (Admin only).
- `DELETE /api/students/:id` - Delete student user and academic profile (Admin only).

### 🍎 Academic Staff Roster
- `GET /api/teachers` - Query teacher staff directories.
- `POST /api/teachers` - Create faculty log (Admin only).
- `PUT /api/teachers/:id` - Modify department details (Admin only).
- `DELETE /api/teachers/:id` - Offboard teacher staff member (Admin only).

### 📘 Curriculum Courses
- `GET /api/courses` - Access courses overview catalog.
- `POST /api/courses` - Formulate subject entry (Admin only).
- `POST /api/courses/:id/enroll` - Register student user assignment to class list.
- `POST /api/courses/:id/unenroll` - Exclude pupil user from course registries.

### 📅 Session Attendances
- `POST /api/attendance` - Compile attendance logs array (Admin & Teacher only).
- `GET /api/attendance` - Query historical percentages and metrics logs.

### 🏆 Grades & Transcripts
- `POST /api/results` - Enter student exam results and auto-grade letters.
- `GET /api/results/reportcard/:studentId` - Compile cumulative transcript summaries, courses GPAs, and pass rates.
