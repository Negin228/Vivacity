import React, { useState } from 'react';
import { Button } from '../../components';
import css from './AddMoreMeetings.module.css';
const ROOT_API_URL =
  process.env.REACT_APP_CANONICAL_ROOT_URL === 'http://localhost:3000'
    ? 'http://localhost:3500'
    : process.env.REACT_APP_CANONICAL_ROOT_URL;

const AddMoreMeetings = ({ listing, location }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleAddMoreMeetings = async () => {
    setIsLoading(true);
    try {
      const currentPath = location.pathname;
      window.location.href = `https://zoom.us/oauth/authorize?response_type=code&client_id=${process.env.REACT_APP_ZOOM_CLIENT_ID}&redirect_uri=${ROOT_API_URL}/api/auth/callback/zoom/extend?backurl=${currentPath}`;
    } catch (error) {
      console.error('Error:', error);
      setIsLoading(false);
    }
  };

  return (
    <Button onClick={handleAddMoreMeetings} className={css.root} disabled={isLoading}>
      {isLoading ? 'Creating More Meetings...' : 'Extend Meetings'}
    </Button>
  );
};

export default AddMoreMeetings;
