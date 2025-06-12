import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { SchoolRecommendationsService } from '@/services/schoolRecommendationsService';
import { API_BASE_URL } from '@/lib/config';

export function useNavigationData() {
  const { user } = useAuth();
  const [hasProfileData, setHasProfileData] = useState(false);
  const [hasRealRecommendations, setHasRealRecommendations] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkDataAvailability = async () => {
      if (!user?.uid) {
        setIsLoading(false);
        return;
      }

      try {
        // Check for profile data
        const profileResponse = await fetch(`${API_BASE_URL}/profiles/status/${user.uid}`);
        if (profileResponse.ok) {
          const profileData = await profileResponse.json();
          setHasProfileData(profileData.status === 'completed');
        }

        // Check for recommendations using the service
        const recStatus = await SchoolRecommendationsService.getGenerationStatus(user.uid);
        setHasRealRecommendations(recStatus.status === 'completed');
      } catch (error) {
        console.error('Error checking data availability:', error);
        // Set defaults on error
        setHasProfileData(false);
        setHasRealRecommendations(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkDataAvailability();
  }, [user?.uid]);

  return {
    hasProfileData,
    hasRealRecommendations,
    isLoading
  };
} 