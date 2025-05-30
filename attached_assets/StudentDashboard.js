// components/StudentDashboard.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import config from '../config';
import { useAuth } from '../context/AuthContext';
import './StudentDashboard.css'; // Import CSS file for styling

const StudentDashboard = () => {
    const { user } = useAuth();

    const [dashboard, setDashboard] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        const userId = user.uid;
        const fetchDashboard = async () => {
            try {
                const response = await axios.get(`${config.API_BASE_URL}/recommendations/student-dashboard/${userId}`);
                setDashboard(response.data.dashboard.studentDashboard);
            } catch (err) {
                setError(err.response ? err.response.data.detail : 'Error fetching dashboard');
            }
        };

        fetchDashboard();
    }, [user.uid]);

    if (error) {
        return <div>Error: {error}</div>;
    }

    if (!dashboard) {
        return <div>Loading...</div>;
    }

    return (
        <div className="student-dashboard">
            <h1 className="welcome-text">Welcome to your dashboard, {user.displayName.split(' ')[0]}!</h1>
            <div className="section">
                <h2>Profile Summary</h2>
                <p>{dashboard.profileSummary}</p>
                {dashboard.sentimentAnalysis}
            </div>
            <div className="section">
                <h2>Strengths</h2>
                <ul>
                    {dashboard.strengths.map((strength, index) => (
                        <li key={index}>{strength}</li>
                    ))}
                </ul>
            </div>
            <div className="section">
                <h2>Growth Areas</h2>
                <ul>
                    {dashboard.growthAreas.map((area, index) => (
                        <li key={index}>{area}</li>
                    ))}
                </ul>
            </div>
            <div className="section">
                <h2>Stand Out Factors</h2>
                <ul>
                    {dashboard.standOutFactorBragList.map((factor, index) => (
                        <li key={index}>{factor}</li>
                    ))}
                </ul>
            </div>
            <div className="section">
                <h2>Application Strategy Tips</h2>
                <ul>
                    {dashboard.applicationStrategyTips.map((tip, index) => (
                        <li key={index}>{tip}</li>
                    ))}
                </ul>
            </div>
            <div className="section">
                <h2>Interest Major Mapping</h2>
                <p>{dashboard.interestMajorMapping}</p>
            </div>
            <div className="section">
                <h2>Potential Extracurriculars</h2>
                <ul>
                    {dashboard.potentialExtracurriculars.map((extracurricular, index) => (
                        <li key={index}>{extracurricular}</li>
                    ))}
                </ul>
            </div>
            <div className="section">
                <h2>Things to Do This Summer</h2>
                <ul>
                    {dashboard.thingsToDoThisSummer.map((thing, index) => (
                        <li key={index}>{thing}</li>
                    ))}
                </ul>
            </div>
            <div className="section">
                <h2>Recommended Reading & Resources</h2>
                <ul>
                    {dashboard.recommendedReadingAndResources.map((resource, index) => (
                        <li key={index}>{resource}</li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default StudentDashboard;