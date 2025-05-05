import { RouterProvider } from 'react-router-dom';
import 'primereact/resources/themes/lara-light-blue/theme.css'; // theme
import 'primereact/resources/primereact.min.css'; // core css
import { useAuthSync } from './sections/auth/useAuthSync';
import { useState } from 'react';


// project imports
import router from 'routes';
import ThemeCustomization from 'themes';

import ScrollTop from 'components/ScrollTop';

// ==============================|| APP - THEME, ROUTER, LOCAL ||============================== //

export default function App() {
  const [user, setUser] = useState(null);

  useAuthSync((currentUser) => {
    setUser(currentUser);
  });
  return (
    <ThemeCustomization>
      <ScrollTop>
        <RouterProvider router={router} />
      </ScrollTop>
    </ThemeCustomization>
  );
}
