import React, { useEffect, useState } from "react";
import { Container, Typography, Box, Tabs, Tab, Paper, Grid } from "@mui/material";
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

function AboutPage() {
  const [tabValue, setTabValue] = useState(0);
  const { user } = useAuth();
  const navigate = useNavigate();
  const formId = 'your_form_id'; // Replace with actual form ID


  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const tabContent = [
    {
      label: "1. Self-Reflection",
      content: (
        <Grid container direction="column" spacing={4}>
          <Grid item xs={12}>
            <Typography
              variant="h4"
              gutterBottom
              sx={{
                color: '#141414',
                letterSpacing: 'light',
                fontSize: '32px',
                fontWeight: 'bold',
                lineHeight: 'tight',
              }}
            >
              Think about who you are.
            </Typography>
            <Typography variant="body1" paragraph>
              The first step in your journey is all about self-reflection. These
              questions are designed to help you uncover your strengths,
              interests, and goals while organizing your thoughts about what you
              want in a college. They go beyond academics, asking about your
              favorite activities, challenges, and what excites you about the
              future.
            </Typography>
            <Typography variant="body1" paragraph>
              It's your chance to think deeply about what matters most to you and
              take inventory of your life. There are no "right" answers—just
              honest ones. Reflect on what matters most to you, the experiences
              that have shaped you, and the environments where you thrive. The
              more thoughtful your responses, the better we can recommend colleges
              that truly fit you.
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Box
              component="img"
              src="/form_screenshot.png"
              alt="College Counseling Portfolio Form"
              sx={{
                width: '100%',
                height: 'auto',
                display: 'block'
              }}
            />
          </Grid>
        </Grid>
      ),
    },
    {
      label: "2. Find Schools",
      content: (
        <Grid container direction="column" spacing={4}>
          <Grid item xs={12}>
          <Typography
              variant="h4"
              gutterBottom
              sx={{
                color: '#141414',
                letterSpacing: 'light',
                fontSize: '32px',
                fontWeight: 'bold',
                lineHeight: 'tight',
              }}
            >
              Find schools that fit who you are.
            </Typography>
            <Typography variant="body1" paragraph>
              Once you've reflected on who you are, our AI gets to work. Using your
              answers, we'll recommend schools that align with your interests,
              goals, and values. These suggestions go beyond rankings to focus on
              what really matters—colleges where you'll thrive academically,
              socially, and personally.
            </Typography>
            <Typography variant="body1">
              But this is just the beginning. Think of these recommendations as a
              starting point for your research. Our AI provides a curated list of
              schools to consider, but you're in control of the process. Dive in,
              explore, and discover colleges that truly fit you.
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Box
              sx={{
                width: '80%',
                maxWidth: '1000px',
                margin: '0 auto',
                borderRadius: '16px',
                overflow: 'hidden',
                boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.1)',
              }}
            >
              <Box
                component="img"
                src="/school_list.png"
                alt="School List Preview"
                sx={{
                  width: '100%',
                  height: 'auto',
                  display: 'block',
                }}
              />
            </Box>
          </Grid>
        </Grid>
      ),
    },
    {
      label: "3. Explore & Decide",
      content: (
        <>
                      <Typography
              variant="h4"
              gutterBottom
              sx={{
                color: '#141414',
                letterSpacing: 'light',
                fontSize: '32px',
                fontWeight: 'bold',
                lineHeight: 'tight',
              }}
            >
            Explore, research, and decide.
          </Typography>
          <Typography variant="body1" paragraph>
            This is where the journey becomes uniquely yours. Take the schools we
            recommend—and any others you're curious about—and dive deeper. Watch
            videos, read student stories, reach out to alumni, and explore what
            makes each school special. Our AI will nudge you with personalized
            "points of interest" to help guide your research and uncover details
            that matter most to you.
          </Typography>
          <Typography variant="body1" paragraph>
            (NOTE: this buddy feature is not yet available!! but we're working on it!) <br/>
            Need help? Use Buddy, your friendly, knowledgeable
            guide. Ask your Buddy questions like:
          </Typography>
          <Typography variant="body1" sx={{ paddingLeft: 2, marginBottom: 2 }}>
            • "What's student life like at this school?" <br />
            • "Are there unique traditions or events here?" <br />
            • "What's the job placement rate for my major?"
          </Typography>
          <Typography variant="body1">
            Buddy is here to simplify the research process, guiding you
            through campus culture, academic programs, and everything in
            between. Whether you're exploring new options or refining your list,
            you're in control—and Buddy is here to support you every step
            of the way.
          </Typography>
        </>
      ),
    },
  ];

  return (
    <Container maxWidth={false} sx={{ padding: 4, backgroundColor: '#FFFFFF' }}>
      <Box
        sx={{
          width: '100%',
          height: 200,
          backgroundImage: 'url("https://cdn.usegalileo.ai/sdxl10/daef395e-c9a7-4822-84a6-055b5e6f18c2.png")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          borderRadius: 2,
          marginBottom: 4,
        }}
      />
      <Typography variant="h3" align="left" gutterBottom sx={{ fontWeight: 'bold', color: '#141414' }}>
        Finding the Right College: How It Works
      </Typography>

      <Paper sx={{ padding: 3, borderRadius: 2, boxShadow: 0, marginBottom: 4 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          textColor="inherit"
          indicatorColor="primary"
          variant="fullWidth"
          TabIndicatorProps={{
            style: {
              backgroundColor: '#359EFF',
            },
          }}
        >
          {tabContent.map((tab, index) => (
            <Tab
              label={tab.label}
              key={index}
              sx={{
                textTransform: 'none',
                fontWeight: 'bold',
                color: tabValue === index ? '#141414' : '#3E4D5B',
              }}
            />
          ))}
        </Tabs>

        <Box sx={{ padding: 3 }}>
          {tabContent[tabValue].content}
        </Box>
      </Paper>
    </Container>
  );
}

export default AboutPage;
