// src/theme.js
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#8b5cf6', // soft violet (matches purple UI)
    },
    secondary: {
      main: '#a855f7', // lighter accent purple
    },
    background: {
      default: '#f3f4f6', // light neutral background
      paper: '#ffffff'
    },
    text: {
      primary: '#111827', // dark gray
      secondary: '#6b7280', // muted gray
    },
  },
  typography: {
    fontFamily: "'Poppins', sans-serif",
  },
});

export default theme;
