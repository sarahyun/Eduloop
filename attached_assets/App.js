import './App.css';
import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Typography,
  Divider,
  Box,
  Button,
} from '@mui/material';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import ForgotPassword from './pages/ForgotPassword';
import FormList from './pages/IntakeForm';
import SchoolList from './pages/SchoolList';
import Chatbot from './pages/Chatbot';
import FormDetail from './pages/FormDetail';
import TaskFlow from './pages/TaskDashboard';
import AboutPage from './pages/AboutPage';
import ProtectedRoute from './components/ProtectedRoute';
import StudentDashboard from './pages/StudentDashboard';
import WelcomePage from './pages/WelcomePage';
import FormWizard from './pages/FormWizard';
import StudentList from './pages/StudentList';
import RoleBasedRoute from './components/RoleBasedRoute';
import StudentDetail from './pages/StudentDetail';
import LandingPage from './pages/LandingPage';
import TasksPage from './pages/tasks/TasksPage';
import QuestionPage from './pages/tasks/QuestionPage';
import QuestionListPage from './pages/tasks/QuestionListPage';
import InsightsPage from './pages/InsightsPage';
import SchoolRecommendations from './pages/schoolRecs/SchoolRecsPage';
const drawerWidth = 260;

function Sidebar() {

  const { user, logout } = useAuth();
  console.log("user", user)
  const navigate = useNavigate();

  if (!user) return null;

  const menuItems = [
    // { text: 'About', path: '/about' },
    // Student-only menu items
    ...(user.role === 'student' ? [
      // { text: 'Get Started', path: '/onboarding' },
      { text: 'Tasks', path: '/tasks' },
      // { text: 'Forms', path: '/forms' },
      // { text: 'Schools', path: '/schools' },
      // { text: 'Insights', path: '/student-dashboard' },
      { text: 'Schools', path: '/rec' },
    ] : []),
    // Counselor-only menu item
    ...(user.role === 'counselor' ? [{ text: 'Students', path: '/students' }] : []),
    // Chat available to all users, but at the end
    // { text: 'Chat', path: '/chat' },
  ];

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          backgroundColor: '#ffffff',
          color: '#000000',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        },
      }}
    >
      <Box sx={{ overflow: 'auto', mt: 2 }}>
        <Box sx={{ px: 3, py: 2 }}>
          <Typography
            variant="h5"
            sx={{
              color: '#000000',
              mb: 1,
              fontWeight: 'bold',
              fontSize: '1.3rem',
              lineHeight: 'normal'
            }}
          >
            CollegeNavigate
          </Typography>
        </Box>
        <Divider />
        <Box sx={{ px: 3, pt: 3, pb: 1 }}>
          <Typography variant="body1" sx={{ color: '#000000', fontSize: '0.875rem', lineHeight: 'normal', fontWeight: 'medium' }}>
            {user.displayName || user.email}
          </Typography>
          <Typography variant="body2" sx={{ color: '#888888', fontSize: '0.875rem', lineHeight: 'normal' }}>
            {user.role === 'student' ? user.grade + 'th Grade' : user.role === 'counselor' ? 'Counselor' : ''}
          </Typography>
        </Box>
        <List sx={{ pl: 2 }}>
          {menuItems.map((item) => (
            <ListItem key={item.text} disablePadding>
              <ListItemButton
                component={Link}
                to={item.path}
                sx={{
                  pl: 3,
                  '&:hover': { backgroundColor: '#e0e0e0' },
                  '&.Mui-selected': { backgroundColor: '#e0e0e0' },
                }}
              >
                <ListItemText
                  primary={item.text}
                  primaryTypographyProps={{
                    sx: {
                      color: '#111418',
                      fontSize: '1rem',
                      fontWeight: 'medium',
                      lineHeight: 'normal',
                    },
                  }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>
      <Box sx={{ px: 3, py: 5 }}>
        <Button
          variant="contained"
          onClick={() => {
            logout().then(() => navigate("/"));
          }}
          fullWidth
          sx={{
            backgroundColor: '#359EFF',
            color: '#FFFFFF',
            borderRadius: '10px',
            fontWeight: 'medium',
            boxShadow: 'none',
            '&:hover': {
              backgroundColor: '#2a8de0',
            },
            textTransform: 'none',
          }}
        >
          Logout
        </Button>
      </Box>
    </Drawer>
  );
}

function AppContent() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (user && (location.pathname === '/login' || location.pathname === '/forgot-password')) {
      navigate('/about'); // Redirect to the "About" page only if the user is on the login page
    }
  }, [user, navigate, location.pathname]);

  return (
    <Box
      component="main"
      sx={{
        flexGrow: 1,
        p: 3,
        width: { sm: `calc(100% - ${drawerWidth}px)` },
        marginLeft: user ? `${drawerWidth}px` : 0,
        minHeight: '100vh',
        backgroundColor: 'white',
        position: 'relative',
        ml: 0,
      }}
    >
      <Routes>
        {/* Conditional Default Route */}
        <Route path="/" element={user ? <Navigate to="/tasks" /> : <LandingPage />} />

        {/* Public Routes */}
        {/* <Route path="/about" element={<AboutPage />} /> */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        
        {/* Student-only Routes */}
        {/* <Route 
          path="/onboarding" 
          element={
            <RoleBasedRoute allowedRoles={['student']}>
              <FormWizard />
            </RoleBasedRoute>
          } 
        /> */}
        {/* <Route 
          path="/forms" 
          element={
            <RoleBasedRoute allowedRoles={['student']}>
              <FormList />
            </RoleBasedRoute>
          } 
        /> */}
        {/* <Route 
          path="/form/:formId" 
          element={
            <RoleBasedRoute allowedRoles={['student']}>
              <FormDetail />
            </RoleBasedRoute>
          } 
        /> */}
        {/* <Route 
          path="/schools" 
          element={
            <RoleBasedRoute allowedRoles={['student']}>
              <SchoolList />
            </RoleBasedRoute>
          } 
        /> */}
        <Route 
          path="/student-dashboard" 
          element={
            <RoleBasedRoute allowedRoles={['student']}>
              <StudentDashboard />
            </RoleBasedRoute>
          } 
        />

        {/* Counselor-only Routes */}
        <Route 
          path="/students" 
          element={
            <RoleBasedRoute allowedRoles={['counselor']}>
              <StudentList />
            </RoleBasedRoute>
          } 
        />
        <Route 
          path="/student/:studentId" 
          element={
            <RoleBasedRoute allowedRoles={['counselor']}>
              <StudentDetail />
            </RoleBasedRoute>
          } 
        />

        {/* Routes available to all authenticated users */}
        <Route 
          path="/chat" 
          element={
            <ProtectedRoute>
              <Chatbot />
            </ProtectedRoute>
          } 
        />

        {/* New Page Route */}
        <Route path="/tasks" element={<TasksPage />} />
        <Route path="/question/:title/:questionId" element={<QuestionPage />} />
        <Route path="/question-list/:title" element={<QuestionListPage />} />
        <Route path="/insights" element={<InsightsPage />} />
        <Route path="/rec" element={<SchoolRecommendations />} />
      </Routes>
    </Box>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Box sx={{ display: 'flex' }}>
          <Sidebar />
          <AppContent />
        </Box>
      </Router>
    </AuthProvider>
  );
}

export default App;
