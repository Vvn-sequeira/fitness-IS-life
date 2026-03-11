# Fitness Tracker

A full-stack web application for tracking fitness progress, including weight logging, calorie intake, macronutrients, water consumption, exercise, and fasting plans. Built with a React frontend and Node.js/Express backend with MongoDB.

## Features

- **User Authentication**: Secure registration and login with JWT tokens
- **Daily Logging**: Track weight, calories, protein, carbs, fat, water intake, exercise, and notes
- **Fasting Plans**: Support for various intermittent fasting schedules (16:8, 14:10, etc.)
- **Gallery**: Upload and manage fitness-related images using Cloudinary
- **Dashboard**: Visualize progress with charts and statistics
- **Responsive Design**: Mobile-friendly interface

## Tech Stack

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **Authentication**: JWT with bcrypt for password hashing
- **File Upload**: Multer with Cloudinary integration
- **CORS** enabled for frontend communication

### Frontend
- **React 19** with Vite for fast development
- **React Router** for navigation
- **Axios** for API calls
- **Recharts** for data visualization
- **React Toastify** for notifications
- **Lucide React** for icons
- **Date-fns** for date handling

## Project Structure

```
fitness-tracker/
├── backend/
│   ├── index.js              # Main server file
│   ├── package.json          # Backend dependencies
│   ├── models/               # MongoDB schemas
│   │   ├── User.js          # User model with fasting plans
│   │   ├── Log.js           # Daily log entries
│   │   ├── Entry.js         # Additional entries
│   │   └── Gallery.js       # Image gallery
│   ├── routes/              # API routes
│   │   ├── auth.js          # Authentication endpoints
│   │   ├── entry.js         # Entry management
│   │   ├── log.js           # Log management
│   │   └── gallery.js       # Gallery management
│   ├── middleware/          # Custom middleware
│   │   ├── auth.js          # JWT authentication
│   │   └── upload.js        # File upload handling
│   └── .env                 # Environment variables
├── frontend/
│   ├── index.html           # Main HTML file
│   ├── package.json         # Frontend dependencies
│   ├── vite.config.js       # Vite configuration
│   ├── eslint.config.js     # ESLint configuration
│   ├── src/
│   │   ├── main.jsx         # React entry point
│   │   ├── App.jsx          # Main App component
│   │   ├── App.css          # Global styles
│   │   ├── index.css        # Additional styles
│   │   ├── api/
│   │   │   └── axiosConfig.js # Axios configuration
│   │   ├── components/      # Reusable components
│   │   │   └── Navbar.jsx   # Navigation bar
│   │   ├── context/         # React context
│   │   │   └── AuthContext.jsx # Authentication context
│   │   └── pages/           # Page components
│   │       ├── AuthPage.jsx # Authentication page
│   │       ├── Dashboard.jsx # Main dashboard
│   │       ├── Gallery.jsx  # Image gallery
│   │       ├── Login.jsx    # Login form
│   │       ├── Register.jsx # Registration form
│   │       └── Management.jsx # Data management
│   └── public/              # Static assets
└── .gitignore               # Git ignore rules
```

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or cloud instance like MongoDB Atlas)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd fitness-tracker
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   ```

   Create a `.env` file in the backend directory with:
   ```
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   PORT=5000
   ```

   Start the backend:
   ```bash
   npm run dev
   ```

3. **Frontend Setup**
   ```bash
   cd ../frontend
   npm install
   npm run dev
   ```

4. **Access the Application**

   Open [http://localhost:5173](http://localhost:5173) in your browser (frontend)
   Backend runs on [http://localhost:5000](http://localhost:5000)

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Logs
- `GET /api/log` - Get user's logs
- `POST /api/log` - Create new log entry
- `PUT /api/log/:id` - Update log entry
- `DELETE /api/log/:id` - Delete log entry

### Gallery
- `GET /api/gallery` - Get user's gallery images
- `POST /api/gallery` - Upload new image
- `DELETE /api/gallery/:id` - Delete image

### Entries
- `GET /api/entry` - Get user's entries
- `POST /api/entry` - Create new entry
- `PUT /api/entry/:id` - Update entry
- `DELETE /api/entry/:id` - Delete entry

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License.

## Acknowledgments

- Built with modern web technologies
- Uses Cloudinary for image hosting
- Charts powered by Recharts
- Icons from Lucide React