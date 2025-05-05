// assets
import { Notifications } from '@mui/icons-material';


// icons
const icons = {
    Notifications
};

// ==============================|| MENU ITEMS - SAMPLE PAGE & DOCUMENTATION ||============================== //

const kolam = {
  id: 'historinotifikasi',
  title: 'Histori Notifikasi',
  type: 'group',
  children: [
    {
          id: 'dashboard',
          title: 'Histori Notifikasi',
          type: 'item',
          url: '/historinotifikasi',
          icon: icons.Notifications,
        },
  ]
};

export default kolam;
