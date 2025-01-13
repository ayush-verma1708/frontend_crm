import React from 'react';
import {
  Typography,
  Box,
  Paper,
  Divider,
  Alert,
} from '@mui/material';
import styled from 'styled-components';
import ImportDataComponent from '../components/ImportDataComponent';
import Menubar from '../components/Menubar';

const AddData = () => {
  return (
    <div className="addData-body">
      <Menubar heading="Add Data"/>
      <PageContainer>
        <PaperContainer elevation={3}>
          <Typography variant='h5' component='h1' gutterBottom>
            Add Data
          </Typography>
          <Divider style={{ marginBottom: '12px' }} />

          {/* Import Component */}
          <SectionContainer>
            <Typography variant='h6' component='h2' gutterBottom>
              Import from Excel
            </Typography>
            <Typography variant='body2' color='textSecondary' gutterBottom>
              Select an Excel file to bulk upload data into the system. Please
              ensure the file format follows the specified columns.
            </Typography>
            <ImportDataComponent />
          </SectionContainer>

          {/* Data Format Guide */}
          <SectionContainer>
            <Typography variant='h6' component='h2' gutterBottom>
              Data Format Guide
            </Typography>
            <Alert severity='warning' style={{ marginBottom: '16px' }}>
              Ensure your file does not contain duplicate entries, as this can
              cause import errors.
            </Alert>
            <Typography variant='body2' color='textSecondary' gutterBottom>
              Format your Excel file with the following columns, and do not repeat
              data entries:
            </Typography>
          </SectionContainer>
        </PaperContainer>
      </PageContainer>
    </div>
  );
};

// Styled Components for layout and styling
const PageContainer = styled(Box)`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center; /* Align items to the top for better spacing */
  padding: 16px;
  max-height: 90vh;
  width: 95vw;
  background-color: #F6FAFD; /* Background color for the whole page */
  box-sizing: border-box;
`;

const PaperContainer = styled(Paper)`
  padding: 16px 32px;
  max-width: 60vw;
  width: 100%;
  border-radius: 8px;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1); /* Optional shadow for depth */
`;

const SectionContainer = styled(Box)`
  // padding: 16px 0;
`;

export default AddData;