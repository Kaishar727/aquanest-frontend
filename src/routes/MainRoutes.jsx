import { lazy } from 'react';

// project imports
import Loadable from 'components/Loadable';
import DashboardLayout from 'layout/Dashboard';

// render- Dashboard
const DashboardDefault = Loadable(lazy(() => import('pages/dashboard/default')));

// render - color
const Color = Loadable(lazy(() => import('pages/component-overview/color')));
const Typography = Loadable(lazy(() => import('pages/component-overview/typography')));
const Shadow = Loadable(lazy(() => import('pages/component-overview/shadows')));

// render - sample page
const Kolam = Loadable(lazy(() => import('pages/dashboard/kolam')));

const Manajemenuser = Loadable(lazy(() => import('pages/dashboard/usermanajemen')));
const Historinotifikasi = Loadable(lazy(() => import('pages/dashboard/historinotifikasi')));

// ==============================|| MAIN ROUTING ||============================== //

const MainRoutes = {
  path: '/',
  element: <DashboardLayout />,
  children: [
    {
      path: '/',
      element: <DashboardDefault />
    },
    {
      path: 'dashboard',
      children: [
        {
          path: 'default',
          element: <DashboardDefault />
        }
      ]
    },
    {
      path: 'typography',
      element: <Typography />
    },
    {
      path: 'color',
      element: <Color />
    },
    {
      path: 'shadow',
      element: <Shadow />
    },
    {
      path: 'kolam',
      element: <Kolam/>
    },
    {
      path: 'manajemenuser',
      element: <Manajemenuser/>
    },
    {
      path: 'historinotifikasi',
      element: <Historinotifikasi/>
    }
  ]
};

export default MainRoutes;
