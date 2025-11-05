import React from 'react';
import DoctorSidebar from '../../components/DoctorSidebar.jsx'; // **FIXED**: Using correct relative path
import { Paper, Typography, Box, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import styles from '../../styles/HelpPage.module.css'; // **FIXED**: Using correct relative path

const DoctorHelp = () => {
  return (
    <div className={styles.helpContainer}>
      <DoctorSidebar />
      <div className={styles.mainContent}>
        <Typography variant="h4" className={styles.headerTitle}>Doctor Help Center</Typography>
        <Typography className={styles.headerSubtitle}>
          Find answers to common questions about your MediLog portal.
        </Typography>

        <Paper className={styles.contentCard}>
          <Typography variant="h5" className={styles.sectionTitle}>Frequently Asked Questions (FAQ)</Typography>

          <Accordion className={styles.accordion}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography className={styles.question}>How do I use my Dashboard?</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography className={styles.answer}>
                Your dashboard provides a quick overview of your practice:
                <ul>
                  <li><b>Stat Cards:</b> Show your total number of patients, today's confirmed appointments, and recent consultations.</li>
                  <li><b>Upcoming Appointments:</b> A list of your next 5 <b>approved</b> appointments.</li>
                  <li><b>Patient Records Hub:</b> Shows the most recent records shared with you by any patient.</li>
                </ul>
              </Typography>
            </AccordionDetails>
          </Accordion>

          <Accordion className={styles.accordion}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography className={styles.question}>How do I manage appointment requests?</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography className={styles.answer}>
                1. Go to the <b>"Appointments"</b> page from your sidebar.
                <br /><br />
                2. You will see a list of <b>"Pending Requests"</b> at the top.
                <br /><br />
                3. You can click <b>"Approve"</b> or <b>"Deny"</b> for each request.
                <br /><br />
                4. When you approve, the appointment is confirmed, and the patient receives an automatic email notification.
              </Typography>
            </AccordionDetails>
          </Accordion>

          <Accordion className={styles.accordion}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography className={styles.question}>How do I see my patients' details and records?</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography className={styles.answer}>
                1. Go to the <b>"Your Patients"</b> page. This page only lists patients who have actively shared at least one record with you.
                <br /><br />
                2. Click on a patient's name to expand their card.
                <br /><br />
                3. You can now see their <b>Patient Details</b> (like emergency info) and a full list of all <b>Shared Records</b> from that specific patient.
              </Typography>
            </AccordionDetails>
          </Accordion>

          <Accordion className={styles.accordion}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography className={styles.question}>How do I update my professional profile?</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography className={styles.answer}>
                Go to the <b>"Profile"</b> page. Here you can update your specialization, designation, department, and professional experience. This information will be visible to patients when they book appointments.
              </Typography>
            </AccordionDetails>
          </Accordion>
        </Paper>

        <Box className={styles.footer}>
          <Typography variant="body2">
            &copy; {new Date().getFullYear()} MediLog Portal. All rights reserved.
          </Typography>
        </Box>
      </div>
    </div>
  );
};

export default DoctorHelp;

