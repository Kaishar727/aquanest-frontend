// assets
import { Dashboard } from '@mui/icons-material';

// icons
const icons = {
  Dashboard
};

// ==============================|| MENU ITEMS - DASHBOARD ||============================== //

const dashboard = {
  id: 'group-dashboard',
  title: 'Navigasi',
  type: 'group',
  children: [
    {
      id: 'dashboard',
      title: 'Dasbor',
      type: 'item',
      url: '/dashboard/default',
      icon: icons.Dashboard,
      breadcrumbs: false
    }
  ]
};

export default dashboard;
