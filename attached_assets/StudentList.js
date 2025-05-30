import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import config from '../config';
import { TextField, Button, IconButton, Container, Typography, Box } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import Tooltip from '@mui/material/Tooltip';
import { useNavigate } from 'react-router-dom';

function StudentList() {
  const { user } = useAuth();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [inviteCode, setInviteCode] = useState('');
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${config.API_BASE_URL}/users/${user.uid}`);
        console.log(response.data)
        console.log(response.data.students)
        setStudents(response.data.students);
        
        const inviteResponse = await axios.get(`${config.API_BASE_URL}/invite-codes/${user.uid}`);
        setInviteCode(inviteResponse.data.code);
      } catch (err) {
        setError('Failed to fetch data');
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user.uid]);

  const handleGenerateNewLink = async () => {
    try {
      const response = await axios.post(`${config.API_BASE_URL}/invite-codes?counselor_id=${user.uid}`);
      setInviteCode(response.data.code);
    } catch (err) {
      console.error('Error generating new invite code:', err);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleStudentClick = (studentId) => {
    console.log(studentId)
    navigate(`/student/${studentId}`);
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="relative flex size-full min-h-screen flex-col bg-[#f8fafb]">
      <Container maxWidth="md" sx={{ flexGrow: 1, pt: 5 }}>
        <Typography
          variant="h3"
          gutterBottom
          align="left"
          sx={{
            fontWeight: 'bold',
            color: '#141414',
            fontSize: '2rem',
            mb: 3
          }}
        >
          Students
        </Typography>

        {/* Invite Link Section */}
        <Box sx={{ maxWidth: '480px', mb: 4 }}>
          <Typography
            variant="body1"
            sx={{ 
              color: '#0e151b',
              fontWeight: 500,
              mb: 1
            }}
          >
            Invite Link
          </Typography>
          <TextField
            value={inviteCode}
            fullWidth
            sx={{ 
              '& .MuiOutlinedInput-root': {
                bgcolor: '#e8eef3',
                borderRadius: '12px',
                height: '56px',
                '& fieldset': {
                  border: 'none'
                }
              }
            }}
            InputProps={{
              readOnly: true,
              endAdornment: (
                <Tooltip title={copied ? "Copied!" : "Copy code"}>
                  <IconButton 
                    onClick={handleCopy}
                    sx={{ color: '#507695' }}
                  >
                    {copied ? <CheckIcon /> : <ContentCopyIcon />}
                  </IconButton>
                </Tooltip>
              ),
            }}
          />
          <Button
            variant="contained"
            onClick={handleGenerateNewLink}
            sx={{
              mt: 2,
              bgcolor: '#e8eef3',
              color: '#0e151b',
              textTransform: 'none',
              fontWeight: 'bold',
              height: '40px',
              borderRadius: '12px',
              '&:hover': {
                bgcolor: '#d1dce6'
              },
              boxShadow: 'none'
            }}
          >
            Generate new code
          </Button>
        </Box>

        {students.length === 0 ? (
          <Box sx={{ maxWidth: '480px', textAlign: 'center' }}>
            <Typography
              sx={{
                fontSize: '1.125rem',
                fontWeight: 'bold',
                lineHeight: 'tight',
                letterSpacing: '-0.015em',
                color: '#0e151b',
                mb: 1
              }}
            >
              You haven't invited any students yet.
            </Typography>
            <Typography
              sx={{
                fontSize: '0.875rem',
                color: '#0e151b',
                mb: 3
              }}
            >
              Connect with your students by sharing 
              your invite code. Students who use your code will appear in your dashboard.
            </Typography>
          </Box>
        ) : (
          <Box sx={{ 
            borderRadius: '12px',
            border: '1px solid #DBE1E6',
            bgcolor: '#FFFFFF',
            overflow: 'hidden'
          }}>
            <table style={{ 
              width: '100%',
              borderCollapse: 'collapse'
            }}>
              <thead>
                <tr style={{ 
                  backgroundColor: '#FFFFFF'
                }}>
                  <th style={{
                    padding: '12px 16px',
                    textAlign: 'left',
                    color: '#141414',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    width: '400px',
                    borderBottom: '1px solid #DBE1E6'
                  }}>
                    Name
                  </th>
                  <th style={{
                    padding: '12px 16px',
                    textAlign: 'left',
                    color: '#141414',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    width: '400px',
                    borderBottom: '1px solid #DBE1E6'
                  }}>
                    Grade
                  </th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <Box
                    component="tr"
                    key={student.user_id}
                    onClick={() => handleStudentClick(student.user_id)}
                    sx={{
                      height: '72px',
                      cursor: 'pointer',
                      transition: 'background-color 0.2s',
                      '&:hover': {
                        backgroundColor: '#F8FAFB',
                      },
                      '& td': {
                        transition: 'background-color 0.2s',
                      },
                      '&:hover td': {
                        backgroundColor: '#F8FAFB',
                      }
                    }}
                  >
                    <td style={{
                      padding: '8px 16px',
                      color: '#141414',
                      fontSize: '0.875rem',
                      width: '400px',
                      borderBottom: '1px solid #DBE1E6'
                    }}>
                      {student.name}
                    </td>
                    <td style={{
                      padding: '8px 16px',
                      color: '#3E4D5B',
                      fontSize: '0.875rem',
                      width: '400px',
                      borderBottom: '1px solid #DBE1E6'
                    }}>
                      {student.grade}
                    </td>
                  </Box>
                ))}
              </tbody>
            </table>
          </Box>
        )}
      </Container>
    </div>
  );
}

export default StudentList; 