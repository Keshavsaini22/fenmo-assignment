import { createTheme } from '@mui/material/styles';

const fenmoTheme = createTheme({
    palette: {
        mode: 'dark',
        primary: {
            main: '#4dabf5', // vibrant blue
        },
        secondary: {
            main: '#f50057', // punchy accent
        },
        background: {
            default: '#121212',
            paper: '#1e1e1e',
        },
    },
    typography: {
        fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
        h1: { fontSize: '2.5rem', fontWeight: 700 },
        h2: { fontSize: '2rem', fontWeight: 600 },
    },
    shape: {
        borderRadius: 12,
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    textTransform: 'none',
                    boxShadow: 'none',
                    fontWeight: 600,
                    '&:hover': {
                        boxShadow: 'none',
                    },
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    backgroundImage: 'none',
                    boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.3)',
                },
            },
        },
    },
});

export default fenmoTheme;
