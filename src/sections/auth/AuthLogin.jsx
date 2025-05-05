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

// Firebase
import { auth,db } from "../../../firebase-config";
import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword,onAuthStateChanged  } from "firebase/auth";
import { getFirestore, setDoc, doc } from "firebase/firestore";



export default function AuthLogin({ isDemo = false }) {
  const [signInMessage, setSignInMessage] = useState('');
  const [signUpMessage, setSignUpMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is logged in, redirect to dashboard
        navigate('../dashboard/default');
      }
    });

    return () => unsubscribe(); // Cleanup on unmount
  }, [navigate]);

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

  const handleSignIn = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      localStorage.setItem('loggedInUserId', user.uid);
      showMessage('Login successful', 'signIn');
      navigate('/dashboard/default'); // Redirect to home page
    } catch (error) {
      if (error.code === 'auth/invalid-credential') {
        showMessage('Incorrect Email or Password', 'signIn');
      } else {
        showMessage('Account does not Exist', 'signIn');
      }
    }
  };

  return (
    <Formik
      initialValues={{
        email: '',
        password: '',
        submit: null
      }}
      validationSchema={Yup.object().shape({
        email: Yup.string().email('Must be a valid email').max(255).required('Email is required'),
        password: Yup.string().max(255).required('Password is required')
      })}
      onSubmit={async (values, { setErrors, setStatus, setSubmitting }) => {
        try {
          await handleSignIn(values.email, values.password);
          setStatus({ success: true });
          setSubmitting(false);
        } catch (err) {
          setStatus({ success: false });
          setErrors({ submit: err.message });
          setSubmitting(false);
        }
      }}
    >
      {({ errors, handleBlur, handleChange, handleSubmit, isSubmitting, touched, values }) => (
        <form noValidate onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Stack spacing={1}>
                <InputLabel htmlFor="email-login">Email Address</InputLabel>
                <OutlinedInput
                  id="email-login"
                  type="email"
                  value={values.email}
                  name="email"
                  onBlur={handleBlur}
                  onChange={handleChange}
                  placeholder="Enter email address"
                  fullWidth
                  error={Boolean(touched.email && errors.email)}
                />
                {touched.email && errors.email && (
                  <FormHelperText error id="standard-weight-helper-text-email-login">
                    {errors.email}
                  </FormHelperText>
                )}
              </Stack>
            </Grid>
            <Grid item xs={12}>
              <Stack spacing={1}>
                <InputLabel htmlFor="password-login">Password</InputLabel>
                <OutlinedInput
                  fullWidth
                  error={Boolean(touched.password && errors.password)}
                  id="password-login"
                  type="password"
                  value={values.password}
                  name="password"
                  onBlur={handleBlur}
                  onChange={handleChange}
                  placeholder="Enter password"
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