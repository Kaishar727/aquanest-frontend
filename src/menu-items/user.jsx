// assets
import { Person2Sharp } from '@mui/icons-material';


// icons
const icons = {
  Person2Sharp
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
          icon: icons.Person2Sharp,
        },
  ]
};

export default kolam;
