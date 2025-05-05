// material-ui
import { useTheme } from '@mui/material/styles';

// ==============================|| LOGO SVG ||============================== //

export default function LogoMain() {
  const theme = useTheme();
  return (
    <>
      <svg width="220" height="70" viewBox="0 0 300 70" fill="none" xmlns="http://www.w3.org/2000/svg">
        <text
          x="0"
          y="50"
          fill={theme.palette.mode === 'dark' ? theme.palette.common.white : theme.palette.primary.main}
          fontFamily="'Poppins', 'Helvetica Neue', Helvetica, Arial, sans-serif"
          fontSize="42"
          fontWeight="700"
          letterSpacing="1.5"
        >
          Aqua
        </text>
        <text
          x="125"
          y="50"
          fill={theme.palette.mode === 'dark' ? theme.palette.primary.light : theme.palette.secondary.main}
          fontFamily="'Poppins', 'Helvetica Neue', Helvetica, Arial, sans-serif"
          fontSize="42"
          fontWeight="700"
          letterSpacing="1.5"
        >
          Nest
        </text>
      </svg>
    </>
  );
}
