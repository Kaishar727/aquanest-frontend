import PropTypes from 'prop-types';
import React, { useState,useEffect } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';

// material-ui
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormHelperText from '@mui/material/FormHelperText';
import Grid from '@mui/material/Grid';
import Link from '@mui/material/Link';
import InputAdornment from '@mui/material/InputAdornment';
import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

// third-party
import * as Yup from 'yup';
import { Formik } from 'formik';

// project imports
import IconButton from 'components/@extended/IconButton';
import AnimateButton from 'components/@extended/AnimateButton';

// assets
import EyeOutlined from '@ant-design/icons/EyeOutlined';
import EyeInvisibleOutlined from '@ant-design/icons/EyeInvisibleOutlined';

//cookies
import Cookies from 'js-cookie';

//Login Backend
const baseURL = import.meta.env.VITE_BASE_URL;

export default function AuthLogin({ isDemo = false }) {
  const [signInMessage, setSignInMessage] = useState('');
  const [signUpMessage, setSignUpMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const cookieUser = Cookies.get("user");
  if (cookieUser) {
    window.location.href = 'dashboard/default';

    }
  }, []);
  

  const showMessage = (message, type) => {
    if (type === 'signIn') {
      setSignInMessage(message);
    } else {
      setSignUpMessage(message);
    }
    
    setTimeout(() => {
      if (type === 'signIn') {
        setSignInMessage('');
      } else {
        setSignUpMessage('');
      }
    }, 5000);
  };

  const handleSignUp = async (email, password, firstName, lastName) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email || !password || !emailRegex.test(email) || password.length < 6) {
      showMessage('Please enter a valid email and password (min. 6 characters)', 'signUp');
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      const userData = {
        email: email,
        firstName: firstName,
        lastName: lastName
      };
      
      await setDoc(doc(db, "users", user.uid), userData);
      showMessage('Account Created Successfully', 'signUp');
      navigate('/'); // Redirect to home page
    } catch (error) {
      if (error.code === 'auth/email-already-in-use') {
        showMessage('Email Address Already Exists!', 'signUp');
      } else {
        showMessage(`Unable to create user: ${error.message}`, 'signUp');
      }
    }
  };

  const handleLogin = async (values) => {
    try {
      const response = await fetch(`${baseURL}/login.php`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });
  
      const data = await response.json(); // <== this contains userData
  
      if (response.ok && data.success) {
        Cookies.set('user', JSON.stringify({
          userid: data.userid,
          fullname: data.fullname,
          username: data.username
        }), { expires: 1 });
        // Redirect to dashboard
        window.location.href = "dashboard/default";
      } else {
        alert(data.message || "Login failed");
      }
    } catch (error) {
      console.error("Login error:", error);
      alert("An error occurred. Check console for details.");
    }
  };
  
  
  

  return (
    <Formik
      initialValues={{
        username: '',
        password: '',
        submit: null
      }}
      validationSchema={Yup.object().shape({
        username: Yup.string().max(255).required('Username is required'),
        password: Yup.string().max(255).required('Password is required')
      })}
      onSubmit={handleLogin}

    >
      {({ errors, handleBlur, handleChange, handleSubmit, isSubmitting, touched, values }) => (
        <form noValidate onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
            <Stack spacing={1}>
              <InputLabel htmlFor="username-login">Username</InputLabel>
              <OutlinedInput
                id="username-login"
                type="text"
                value={values.username}
                name="username"
                onBlur={handleBlur}
                onChange={handleChange}
                placeholder="Masukkan Username"
                fullWidth
                error={Boolean(touched.username && errors.username)}
              />
              {touched.username && errors.username && (
                <FormHelperText error id="standard-weight-helper-text-username-login">
                  {errors.username}
                </FormHelperText>
              )}
            </Stack>

            </Grid>
            <Grid item xs={12}>
              <Stack spacing={1}>
                <InputLabel htmlFor="password-login">Kata Sandi</InputLabel>
                <OutlinedInput
                  fullWidth
                  error={Boolean(touched.password && errors.password)}
                  id="password-login"
                  type="password"
                  value={values.password}
                  name="password"
                  onBlur={handleBlur}
                  onChange={handleChange}
                  placeholder="Masukkan Kata Sandi"
                />
                {touched.password && errors.password && (
                  <FormHelperText error id="standard-weight-helper-text-password-login">
                    {errors.password}
                  </FormHelperText>
                )}
              </Stack>
            </Grid>
            
            {signInMessage && (
              <Grid item xs={12}>
                <Typography color={signInMessage.includes('successful') ? 'success.main' : 'error.main'}>
                  {signInMessage}
                </Typography>
              </Grid>
            )}

            <Grid item xs={12}>
              <AnimateButton>
                <Button
                  disableElevation
                  disabled={isSubmitting}
                  fullWidth
                  size="large"
                  type="submit"
                  variant="contained"
                  color="primary"
                >
                  Login
                </Button>
              </AnimateButton>
            </Grid>
          </Grid>
        </form>
      )}
    </Formik>
  );
}

AuthLogin.propTypes = { isDemo: PropTypes.bool };