// ImportDataComponent.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { Button, CircularProgress, Typography, Box } from '@mui/material';
import styled from 'styled-components';

const ImportDataComponent = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [file, setFile] = useState(null);

  const handleFileChange = (event) => {
    setFile(event.target.files[0]); // Capture the selected file
    setMessage('');
    setError('');
  };

  const handleImportData = async () => {
    if (!file) {
      setError('Please select a file first!');
      return;
    }

    setLoading(true);
    setMessage('');
    setError('');

    const formData = new FormData();
    formData.append('file', file); // Add the file to the FormData object

    try {
      const response = await axios.post(
        // 'https://www.api.thewithinkers.com/api/import',
        'http://localhost:5001/api/import',

        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      setMessage(response.data.message);
    } catch (err) {
      setError(
        err.response
          ? err.response.data.message
          : 'An error occurred while importing data'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <Typography variant='h6' component='h1' gutterBottom>
        Import Data from Excel
      </Typography>
      <FileInput type='file' accept='.xlsx, .xls' onChange={handleFileChange} />
      <Button
        variant='contained'
        color='primary'
        onClick={handleImportData}
        disabled={loading}
        style={{ marginTop: '16px' }}
      >
        {loading ? (
          <CircularProgress size={24} color='inherit' />
        ) : (
          'Import Data'
        )}
      </Button>

      {/* Display success or error message */}
      {message && <SuccessMessage>{message}</SuccessMessage>}
      {error && <ErrorMessage>{error}</ErrorMessage>}
    </Container>
  );
};

// Styled Components
const Container = styled(Box)`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px;
  border-radius: 8px;
  background-color: #f9f9f9;
  box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
  max-width: 400px;
  margin: auto;
`;

const FileInput = styled.input`
  margin-top: 20px;
  padding: 10px;
  border-radius: 4px;
  border: 1px solid #ddd;
  width: 100%;
  max-width: 300px;
`;

const SuccessMessage = styled(Typography)`
  color: green;
  margin-top: 20px;
`;

const ErrorMessage = styled(Typography)`
  color: red;
  margin-top: 20px;
`;

export default ImportDataComponent;