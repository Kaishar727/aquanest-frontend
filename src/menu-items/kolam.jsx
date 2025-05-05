// assets
import { WaterDrop } from '@mui/icons-material';


// icons
const icons = {
  WaterDrop
};

// ==============================|| MENU ITEMS - SAMPLE PAGE & DOCUMENTATION ||============================== //

const kolam = {
  id: 'kolamsection',
  title: 'Kolam',
  type: 'group',
  children: [
    {
          id: 'dashboard',
          title: 'Kolam',
          type: 'item',
          url: '/kolam',
          icon: icons.WaterDrop,
        },
  ]
};

export default kolam;
