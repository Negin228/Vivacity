import React, { useState } from 'react';
import { Button } from '../../components';
const ROOT_API_URL =
  process.env.REACT_APP_CANONICAL_ROOT_URL === 'http://localhost:3000'
    ? 'http://localhost:3500'
    : process.env.REACT_APP_CANONICAL_ROOT_URL;
const AddMoreMeetings = ({ listing }) => {
  const [isLoading, setIsLoading] = useState(false);
  console.log(listing, 'listing');
  const handleAddMoreMeetings = async () => {
    setIsLoading(true);
    try {
      const currentPath = window.location.pathname;
      console.log(currentPath, 'currentPath');
      const fullRedirectUri = `${ROOT_API_URL}/api/auth/callback/zoom/extend`;

      // Fix URL parameter structure
      window.location.href = `https://zoom.us/oauth/authorize?response_type=code&client_id=${
        process.env.REACT_APP_ZOOM_CLIENT_ID
      }&redirect_uri=${fullRedirectUri}&state=${listing.id.uuid}&backurl=${encodeURIComponent(
        currentPath
      )}`;
    } catch (error) {
      console.error('Error:', error);
      setIsLoading(false);
    }
  };
  return (
    <Button onClick={handleAddMoreMeetings} disabled={isLoading}>
      {isLoading ? 'Creating More Meetings...' : 'Extend Meetings'}
    </Button>
  );
};

export default AddMoreMeetings;
