import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Home from './pages/Home';
import Profile from './pages/Profile';
import Explore from './pages/Explore';

const AppRoutes = () => {
    const { isAuthenticated } = useAuth();

    return (
        <Routes>
            <Route
                path="/login"
                element={isAuthenticated ? <Navigate to="/" replace /> : <Login />}
            />
            <Route
                path="/signup"
                element={isAuthenticated ? <Navigate to="/" replace /> : <Signup />}
            />
            <Route
                path="/"
                element={
                    <PrivateRoute>
                        <Navbar />
                        <Home />
                    </PrivateRoute>
                }
            />
            <Route
                path="/explore"
                element={
                    <PrivateRoute>
                        <Navbar />
                        <Explore />
                    </PrivateRoute>
                }
            />
            <Route
                path="/profile/:userId"
                element={
                    <PrivateRoute>
                        <Navbar />
                        <Profile />
                    </PrivateRoute>
                }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
};

function App() {
    return (
        <Router>
            <AuthProvider>
                <div className="min-h-screen bg-gray-50">
                    <AppRoutes />
                </div>
            </AuthProvider>
        </Router>
    );
}

export default App;
