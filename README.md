# SmartStay Hub - Room Finding Web Application

SmartStay Hub is a comprehensive MERN stack (MongoDB, Express.js, React, Node.js) application designed to simplify the process of finding and listing rental rooms. It connects landlords with potential tenants through a user-friendly interface.

![Project Status](https://img.shields.io/badge/Status-Active-success)
![License](https://img.shields.io/badge/License-MIT-blue)

## 🌟 Features

### For Users (Tenants)
- **Advanced Search:** Filter rooms by city, location, room type, tenant type, and rent range.
- **Room Details:** View detailed information, amenities, and high-quality images.
- **Contact Owners:** Send messages directly to room owners.
- **Responsive Design:** Seamless experience across desktop and mobile devices.

### For Owners (Landlords)
- **Easy Listing:** Post room ads with photos, descriptions, and rental details.
- **Management:** View and manage your listed properties.
- **Real-time Notifications:** Receive updates via Socket.IO when users contact you.

### For Admins
- **Dashboard:** Overview of system statistics.
- **Content Moderation:** Approve or reject room listings to ensure quality.
- **User Management:** Manage user roles and accounts.

## 🛠 Technologies Used

- **Frontend:** React (Vite), TypeScript, Tailwind CSS, Shadcn UI, React Query, React Router DOM.
- **Backend:** Node.js, Express.js, Socket.IO.
- **Database:** MongoDB (with fallback to In-Memory MongoDB for testing).
- **Authentication:** JWT (JSON Web Tokens) with Access & Refresh Token rotation.
- **Image Upload:** Multer.

## 📂 Project Structure

```
smartstay-hub/
├── backend/                # Node.js + Express Backend
│   ├── config/             # Database configuration
│   ├── controllers/        # Route logic
│   ├── middleware/         # Auth & Error handling
│   ├── models/             # Mongoose Models
│   ├── routes/             # API Routes
│   ├── uploads/            # Static image uploads
│   └── server.js           # Entry point
├── src/                    # React Frontend
│   ├── components/         # Reusable UI components
│   ├── context/            # Auth & Global State
│   ├── hooks/              # Custom React Hooks
│   ├── lib/                # API & Utilities
│   ├── pages/              # Application Pages
│   └── App.tsx             # Main Component
├── public/                 # Static assets
├── .env                    # Frontend Environment Variables
└── package.json            # Project dependencies
```

## 🚀 Installation & Setup

### Prerequisites
- Node.js (v18+ recommended)
- MongoDB (Optional: The app falls back to an in-memory database if MongoDB is not running locally).

### 1. Clone the Repository
```bash
git clone <repository-url>
cd smartstay-hub
```

### 2. Backend Setup
Navigate to the backend folder and install dependencies:
```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` directory (or ensure the root `.env` values are accessible):
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/smartstay-hub
JWT_SECRET=your_jwt_secret
JWT_ACCESS_EXPIRE=1h
JWT_REFRESH_EXPIRE_SECONDS=604800
MOCK_OTP=123456
FRONTEND_URL=http://localhost:8080
UPLOAD_FOLDER=uploads
NODE_ENV=development
```

### 3. Frontend Setup
Navigate to the root directory and install dependencies:
```bash
cd ..
npm install
```

Ensure the root `.env` file is configured:
```env
VITE_API_BASE_URL=/api
VITE_SOCKET_URL=http://localhost:5000
VITE_FRONTEND_URL=http://localhost:8080
```

## 🏃‍♂️ How to Run

You need to run both the backend and frontend servers.

### 1. Start Backend
Open a terminal:
```bash
cd backend
npm start
```
*The server will run on `http://localhost:5000`. If local MongoDB is not found, it will start an in-memory database.*

### 2. Start Frontend
Open a **new** terminal:
```bash
npm run dev
```
*The application will run on `http://localhost:8080`.*

## 🔑 Key API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| **POST** | `/api/auth/send-otp` | Send mock OTP (Default: 123456) |
| **POST** | `/api/auth/verify-otp` | Login/Register with OTP |
| **GET** | `/api/rooms/search` | Search rooms with filters |
| **GET** | `/api/rooms/:id` | Get room details |
| **POST** | `/api/rooms/add` | Add a new room (Auth required) |

## 🔮 Future Improvements
- [x] Integration with Firebase Phone Authentication for secure login.
- [ ] Map integration for visual location search.
- [ ] Payment gateway for booking deposits.
- [ ] Advanced chat features between owners and tenants.

## ✍️ Author
**SmartStay Team**
