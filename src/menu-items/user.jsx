// assets
import { WaterDrop } from '@mui/icons-material';


// icons
const icons = {
  WaterDrop
};

// ==============================|| MENU ITEMS - SAMPLE PAGE & DOCUMENTATION ||============================== //

const kolam = {
  id: 'manajemenuser',
  title: 'Manajemen User',
  type: 'group',
  children: [
    {
          id: 'dashboard',
          title: 'User',
          type: 'item',
          url: '/manajemenuser',
          icon: icons.WaterDrop,
        },
  ]
};

export default kolam;
