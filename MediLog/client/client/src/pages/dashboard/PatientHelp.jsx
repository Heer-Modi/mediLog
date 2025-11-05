import React from 'react';
import Sidebar from '../../components/Sidebar.jsx'; // **FIXED**: Using correct relative path
import { Paper, Typography, Box, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import styles from '../../styles/HelpPage.module.css'; // **FIXED**: Using correct relative path

const PatientHelp = () => {
  return (
    <div className={styles.helpContainer}>
      <Sidebar />
      <div className={styles.mainContent}>
        <Typography variant="h4" className={styles.headerTitle}>Patient Help Center</Typography>
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
                Your dashboard is your main hub. It shows you:
                <ul>
                  <li><b>Upcoming Reminders:</b> A list of your approved appointments and medicine reminders.</li>
                  <li><b>Medicine Progress:</b> A percentage of how many medicines you've marked as "taken" for today.</li>
                  <li><b>Next Appointment:</b> A card showing the details of your next confirmed appointment.</li>
                  <li><b>Emergency Info:</b> A quick view of your blood group and allergies.</li>
                </ul>
              </Typography>
            </AccordionDetails>
          </Accordion>

          <Accordion className={styles.accordion}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography className={styles.question}>How do I upload and view records?</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography className={styles.answer}>
                1. Go to the <b>"Upload"</b> page to add new files. Fill in the title, date, and select a category.
                <br /><br />
                2. Go to the <b>"Records"</b> page to see all your uploaded files, organized into folders by category. You can click a file to view it.
              </Typography>
            </AccordionDetails>
          </Accordion>

          <Accordion className={styles.accordion}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography className={styles.question}>How do I share a record with my doctor?</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography className={styles.answer}>
                1. Go to the <b>"Records"</b> page and open a folder.
                <br />
                2. Find the file you want to share and click the <b>Share icon</b> (a small arrow).
                <br />
                3. A modal will pop up. Select your doctor's name from the dropdown list.
                <br />
                4. Click "Share". Your doctor will now be able to see this specific file from their portal.
              </Typography>
            </AccordionDetails>
          </Accordion>

          <Accordion className={styles.accordion}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography className={styles.question}>How do appointments work?</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography className={styles.answer}>
                1. Go to the <b>"Calendar"</b> page and click on a date.
                <br />
                2. In the popup, change the "Event Type" to <b>"Appointment"</b>.
                <br />
                3. A new <b>"Select Doctor"</b> dropdown will appear. You MUST select a doctor.
                <br />
                4. When you save, this is sent to the doctor as a <b>request</b>. It will appear on your calendar as "(Pending)".
                <br />
                5. Once the doctor <b>approves</b> your request, you will get an email, and the appointment will appear on your dashboard.
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

export default PatientHelp;

