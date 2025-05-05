import PropTypes from 'prop-types';
import { initializeApp } from "firebase/app";

import { useRef, useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
// Import the auth and db from your config file
import { auth, db } from "../../../../../../firebase-config";

import { useNavigate } from 'react-router-dom';



// material-ui
import { useTheme } from '@mui/material/styles';
import ButtonBase from '@mui/material/ButtonBase';
import CardContent from '@mui/material/CardContent';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import Grid from '@mui/material/Grid2';
import Paper from '@mui/material/Paper';
import Popper from '@mui/material/Popper';
import Stack from '@mui/material/Stack';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

// project imports
import ProfileTab from './ProfileTab';
import SettingTab from './SettingTab';
import Avatar from 'components/@extended/Avatar';
import MainCard from 'components/MainCard';
import Transitions from 'components/@extended/Transitions';
import IconButton from 'components/@extended/IconButton';

// assets
import LogoutOutlined from '@ant-design/icons/LogoutOutlined';
import SettingOutlined from '@ant-design/icons/SettingOutlined';
import UserOutlined from '@ant-design/icons/UserOutlined';
import avatar1 from 'assets/images/users/avatar-1.png';

// tab panel wrapper
function TabPanel({ children, value, index, ...other }) {
  return (
    <div role="tabpanel" hidden={value !== index} id={`profile-tabpanel-${index}`} aria-labelledby={`profile-tab-${index}`} {...other}>
      {value === index && children}
    </div>
  );
}

function a11yProps(index) {
  return {
    id: `profile-tab-${index}`,
    'aria-controls': `profile-tabpanel-${index}`
  };
}

export default function Profile() {

  const theme = useTheme();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();


  const anchorRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(0);

  // Fetch user data on component mount
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        navigate('/login');
      } else {
        // Load user data if authenticated
        const loadUserData = async () => {
          try {
            const userDoc = await getDoc(doc(db, "users", user.uid));
            if (userDoc.exists()) {
              setUserData(userDoc.data());
            }
          } catch (error) {
            console.error("Error fetching user data:", error);
          } finally {
            setLoading(false);
          }
        };
        loadUserData();
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  const handleClose = (event) => {
    if (anchorRef.current && anchorRef.current.contains(event.target)) {
      return;
    }
    setOpen(false);
  };

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUserData(null);  // Clear user data
      localStorage.removeItem('loggedInUserId');
      navigate('/login');  // Redirect to login page
      console.log("Signed out successfully");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  if (loading) {
    return <div>Loading...</div>; // Or a proper loading spinner
  }

  return (
    <Box sx={{ flexShrink: 0, ml: 0.75 }}>
      <ButtonBase
        sx={(theme) => ({
          p: 0.25,
          bgcolor: open ? 'grey.100' : 'transparent',
          borderRadius: 1,
          '&:hover': { bgcolor: 'secondary.lighter' },
          '&:focus-visible': { outline: `2px solid ${theme.palette.secondary.dark}`, outlineOffset: 2 },
          ...theme.applyStyles('dark', { bgcolor: open ? 'background.default' : 'transparent', '&:hover': { bgcolor: 'secondary.light' } })
        })}
        aria-label="open profile"
        ref={anchorRef}
        aria-controls={open ? 'profile-grow' : undefined}
        aria-haspopup="true"
        onClick={handleToggle}
      >
        <Stack direction="row" sx={{ gap: 1.25, alignItems: 'center', p: 0.5 }}>
          <Avatar alt="profile user" src={avatar1} size="sm" />
          <Typography variant="subtitle1" sx={{ textTransform: 'capitalize' }}>
            {userData ? `${userData.firstName} ${userData.lastName}` : 'Guest'}
          </Typography>
        </Stack>
      </ButtonBase>
      <Popper
        placement="bottom-end"
        open={open}
        anchorEl={anchorRef.current}
        role={undefined}
        transition
        disablePortal
        popperOptions={{
          modifiers: [
            {
              name: 'offset',
              options: {
                offset: [0, 9]
              }
            }
          ]
        }}
      >
        {({ TransitionProps }) => (
          <Transitions type="grow" position="top-right" in={open} {...TransitionProps}>
            <Paper sx={(theme) => ({ boxShadow: theme.customShadows.z1, width: 290, minWidth: 240, maxWidth: { xs: 250, md: 290 } })}>
              <ClickAwayListener onClickAway={handleClose}>
                <MainCard elevation={0} border={false} content={false}>
                  <CardContent sx={{ px: 2.5, pt: 3 }}>
                    <Grid container justifyContent="space-between" alignItems="center">
                      <Grid>
                        <Stack direction="row" sx={{ gap: 1.25, alignItems: 'center' }}>
                          <Avatar alt="profile user" src={avatar1} sx={{ width: 32, height: 32 }} />
                          <Stack>
                            <Typography variant="h6">
                              {userData ? `${userData.firstName} ${userData.lastName}` : 'Guest'}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {userData?.email || 'No email'}
                            </Typography>
                          </Stack>
                        </Stack>
                      </Grid>
                      <Grid>
                        <Tooltip title="Logout">
                          <IconButton 
                            size="large" 
                            sx={{ color: 'text.primary' }}
                            onClick={handleLogout}
                          >
                            <LogoutOutlined />
                          </IconButton>
                        </Tooltip>
                      </Grid>
                    </Grid>
                  </CardContent>
                  <TabPanel value={value} index={0} dir={theme.direction}>
                    <ProfileTab handleLogout={handleLogout} />
                  </TabPanel>
                  <TabPanel value={value} index={1} dir={theme.direction}>
                    <SettingTab userData={userData} />
                  </TabPanel>
                </MainCard>
              </ClickAwayListener>
            </Paper>
          </Transitions>
        )}
      </Popper>
    </Box>
  );
}

TabPanel.propTypes = { children: PropTypes.node, value: PropTypes.number, index: PropTypes.number, other: PropTypes.any };