import React, { useState } from 'react';
import { Container, TextField, Button, Typography, Box } from '@mui/material';

function Chatbot() {
  const [message, setMessage] = useState('');
  const [responses, setResponses] = useState([]);

  const handleSend = () => {
    setResponses([...responses, `You: ${message}`, 'AI: Here’s some advice!']);
    setMessage('');
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 5 }}>
        <Typography variant="h4">Chat with Buddy</Typography>
        <Box sx={{ height: 300, overflowY: 'scroll', my: 2, border: '1px solid #ddd', p: 2 }}>
          {responses.map((res, index) => (
            <Typography key={index}>{res}</Typography>
          ))}
        </Box>
        <TextField
          fullWidth
          label="Ask a question"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <Button variant="contained" onClick={handleSend} sx={{mt: 2, backgroundColor: '#2a8de0', color: 'white', textTransform: 'none' }} >
          Send
        </Button>
      </Box>
    </Container>
  );
}

export default Chatbot;
