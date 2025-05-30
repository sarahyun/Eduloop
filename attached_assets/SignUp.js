import React, { useState, useEffect } from 'react';
import { Container, TextField, Button, Typography, Box, Link, Alert, CircularProgress, Select, MenuItem, InputLabel, FormControl } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function SignUp() {
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('student');
  const [grade, setGrade] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { signup, currentUser } = useAuth();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const emailParam = params.get('email');
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [location.search]);

  useEffect(() => {
    if (currentUser) {
      navigate('/dashboard');
    }
  }, [currentUser, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      return setError('Passwords do not match');
    }

    try {
      setError('');
      setLoading(true);
      // await signup(email, password, name, role, grade, inviteCode);
      await signup(email, password, name, role, grade);
      console.log('Signup successful, navigating to onboarding');
      navigate('/tasks');
    } catch (error) {
      console.log('Signup error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="xs">
      <Box sx={{ mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography variant="h4" align="center" gutterBottom>
          Sign Up
        </Typography>

        {error && <Alert severity="error" sx={{ width: '100%', mb: 2 }}>{error}</Alert>}

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
          <TextField
            fullWidth
            label="Full Name"
            margin="normal"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={loading}
          />
          <TextField
            fullWidth
            label="Email"
            margin="normal"
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
          />
          <TextField
            fullWidth
            label="Password"
            type="password"
            margin="normal"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
          />
          <TextField
            fullWidth
            label="Confirm Password"
            type="password"
            margin="normal"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={loading}
          />

          {/* Role Selection Dropdown */}
          <Select
            fullWidth
            value={role}
            onChange={(e) => setRole(e.target.value)}
            displayEmpty
            disabled={loading}
            sx={{ mt: 2 }}
          >
            <MenuItem value="student">Student</MenuItem>
            <MenuItem value="counselor">Counselor</MenuItem>
          </Select>

          {role === 'student' && (
            <>
              <FormControl fullWidth sx={{ mt: 2 }} disabled={loading}>
                <InputLabel id="grade-label">Grade</InputLabel>
                <Select
                  labelId="grade-label"
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  // label="Grade"
                  sx={{
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#359EFF',
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#359EFF',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#359EFF',
                    },
                  }}
                >
                  <MenuItem value="" disabled>
                    Select Grade
                  </MenuItem>
                  <MenuItem value="9">9th Grade</MenuItem>
                  <MenuItem value="10">10th Grade</MenuItem>
                  <MenuItem value="11">11th Grade</MenuItem>
                  <MenuItem value="12">12th Grade</MenuItem>
                </Select>
              </FormControl>
              {/* <TextField
                fullWidth
                label="Counselor Invite Code (Optional)"
                margin="normal"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
                disabled={loading}
              /> */}
            </>
          )}

          <Button
            type="submit"
            variant="contained"
            fullWidth
            sx={{ mt: 3, mb: 2, backgroundColor: '#359EFF', color: 'white', textTransform: 'none' }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Sign Up'}
          </Button>

          <Box sx={{ textAlign: 'center' }}>
            <Link href="/login" variant="body2">
              Already have an account? Log in
            </Link>
          </Box>
        </Box>
      </Box>
    </Container>
  );
}

export default SignUp;