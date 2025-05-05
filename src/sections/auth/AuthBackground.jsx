import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import ikanLele from 'assets/images/ikanLele.svg'; // Update path as needed

export default function AuthBackground() {
  const theme = useTheme();

  return (
    <Box
      sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: -1,
        overflow: 'hidden',
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <img 
        src={ikanLele} 
        alt="background" 
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'fill',
          opacity: 0.5 // Optional: adjust opacity if needed
        }} 
      />
    </Box>
  );
}