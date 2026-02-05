# Real-Time Social Media Web Application

A full-stack social media platform built with the MERN stack, featuring real-time notifications, user authentication, posts, comments, likes, and a follow system.

## 🚀 Features

### Core Features
- **User Authentication**: Secure signup and login with JWT tokens
- **User Profiles**: Customizable profiles with bio and profile pictures
- **Posts**: Create, edit, and delete posts with optional images
- **Engagement**: Like and comment on posts
- **Follow System**: Follow/unfollow users and view followers/following
- **Personalized Feed**: See posts from users you follow
- **Explore**: Discover new users and latest posts
- **Real-time Notifications**: Get instant notifications for follows, likes, and comments
- **Responsive Design**: Beautiful UI that works on all devices

### Tech Stack
- **Frontend**: React.js + Tailwind CSS + Vite
- **Backend**: Node.js + Express.js
- **Database**: MongoDB
- **Real-time**: Socket.io
- **Authentication**: JWT (JSON Web Tokens)

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn

## 🛠️ Installation & Setup

### 1. Clone the Repository
```bash
cd "Real-Time Social Media Web Application"
```

### 2. Backend Setup
```bash
cd backend
npm install
```

Create a `.env` file in the backend directory:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/social-media
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

For MongoDB Atlas, replace `MONGODB_URI` with your connection string.

### 3. Frontend Setup
```bash
cd frontend
npm install
```

Create a `.env` file in the frontend directory:
```env
VITE_API_URL=http://localhost:5000/api
```

## 🚀 Running the Application

### Start MongoDB (if using local MongoDB)
```bash
mongod
```

### Start Backend Server
```bash
cd backend
npm start
```
Backend will run on `http://localhost:5000`

### Start Frontend Development Server
```bash
cd frontend
npm run dev
```
Frontend will run on `http://localhost:5173`

## 📦 Project Structure

```
Real-Time Social Media Web Application/
├── backend/
│   ├── models/              # MongoDB schemas
│   │   ├── User.js
│   │   ├── Post.js
│   │   └── Notification.js
│   ├── routes/              # API routes
│   │   ├── authRoutes.js
│   │   ├── userRoutes.js
│   │   ├── postRoutes.js
│   │   └── notificationRoutes.js
│   ├── middleware/          # Custom middleware
│   │   └── auth.js
│   ├── socket/              # Socket.io configuration
│   │   └── socket.js
│   ├── server.js            # Main server file
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/      # Reusable components
    │   │   ├── Navbar.jsx
    │   │   ├── PostCard.jsx
    │   │   ├── CreatePost.jsx
    │   │   ├── CommentSection.jsx
    │   │   ├── NotificationDropdown.jsx
    │   │   └── PrivateRoute.jsx
    │   ├── pages/           # Page components
    │   │   ├── Login.jsx
    │   │   ├── Signup.jsx
    │   │   ├── Home.jsx
    │   │   ├── Profile.jsx
    │   │   └── Explore.jsx
    │   ├── context/         # React context
    │   │   └── AuthContext.jsx
    │   ├── utils/           # Utility functions
    │   │   ├── api.js
    │   │   ├── socket.js
    │   │   └── dateUtils.js
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    └── package.json
```

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user

### Users
- `GET /api/users/profile/:userId` - Get user profile
- `PUT /api/users/profile` - Update own profile
- `POST /api/users/follow/:userId` - Follow user
- `POST /api/users/unfollow/:userId` - Unfollow user
- `GET /api/users/:userId/followers` - Get followers
- `GET /api/users/:userId/following` - Get following
- `GET /api/users/search?q=query` - Search users

### Posts
- `POST /api/posts` - Create post
- `PUT /api/posts/:postId` - Edit post
- `DELETE /api/posts/:postId` - Delete post
- `GET /api/posts/:postId` - Get single post
- `POST /api/posts/:postId/like` - Like/unlike post
- `POST /api/posts/:postId/comment` - Add comment
- `DELETE /api/posts/:postId/comment/:commentId` - Delete comment
- `GET /api/posts/feed/personalized` - Get personalized feed
- `GET /api/posts/latest/all` - Get latest posts
- `GET /api/posts/user/:userId` - Get user posts

### Notifications
- `GET /api/notifications` - Get notifications
- `PUT /api/notifications/:notificationId/read` - Mark as read
- `PUT /api/notifications/read-all/bulk` - Mark all as read
- `GET /api/notifications/unread-count/count` - Get unread count

## 🚀 Deployment

### Frontend (Vercel)
1. Push code to GitHub
2. Import project in Vercel
3. Set environment variables:
   - `VITE_API_URL` = Your backend URL
4. Deploy

### Backend (Render)
1. Push code to GitHub
2. Create new Web Service in Render
3. Set environment variables:
   - `MONGODB_URI` = MongoDB Atlas connection string
   - `JWT_SECRET` = Your secret key
   - `FRONTEND_URL` = Your Vercel frontend URL
   - `NODE_ENV` = production
4. Deploy

## 🎨 Features Showcase

- **Beautiful UI**: Modern, clean design with Tailwind CSS
- **Real-time Updates**: Instant notifications using Socket.io
- **Responsive**: Works seamlessly on mobile, tablet, and desktop
- **Image Upload**: Support for profile pictures and post images (base64)
- **Form Validation**: Client-side and server-side validation
- **Error Handling**: Comprehensive error handling and user feedback
- **Loading States**: Smooth loading indicators
- **Empty States**: Helpful messages when no content is available

## 🔒 Security Features

- Password hashing with bcrypt
- JWT token authentication
- Protected API routes
- Input validation and sanitization
- CORS configuration
- Environment variables for sensitive data

## 📝 License

This project is open source and available under the MIT License.

## 👨‍💻 Author

Built with ❤️ using the MERN stack

## 🙏 Acknowledgments

- React.js for the amazing frontend framework
- Express.js for the robust backend framework
- MongoDB for the flexible database
- Socket.io for real-time capabilities
- Tailwind CSS for the beautiful styling
