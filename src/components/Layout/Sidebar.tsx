import {
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
} from '@mui/material';
import {
  People as PeopleIcon,
  Restaurant as RestaurantIcon,
  Book as BookIcon,
  BarChart as BarChartIcon,
  ExpandLess,
  ExpandMore,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';

/**
 * Sidebar navigation component
 */
export const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [dictionariesOpen, setDictionariesOpen] = useState(false);
  const [statisticsOpen, setStatisticsOpen] = useState(false);

  const isActive = (path: string) => location.pathname.startsWith(path);

  return (
    <List component="nav" sx={{ pt: 2 }}>
      <ListItemButton
        selected={isActive('/employees')}
        onClick={() => navigate('/employees')}
      >
        <ListItemIcon>
          <PeopleIcon />
        </ListItemIcon>
        <ListItemText primary="Сотрудники" />
      </ListItemButton>

      <ListItemButton
        selected={isActive('/restaurants')}
        onClick={() => navigate('/restaurants')}
      >
        <ListItemIcon>
          <RestaurantIcon />
        </ListItemIcon>
        <ListItemText primary="Рестораны" />
      </ListItemButton>

      <ListItemButton onClick={() => setDictionariesOpen(!dictionariesOpen)}>
        <ListItemIcon>
          <BookIcon />
        </ListItemIcon>
        <ListItemText primary="Справочники" />
        {dictionariesOpen ? <ExpandLess /> : <ExpandMore />}
      </ListItemButton>
      <Collapse in={dictionariesOpen} timeout="auto" unmountOnExit>
        <List component="div" disablePadding>
          <ListItemButton
            sx={{ pl: 4 }}
            selected={isActive('/dictionaries')}
            onClick={() => navigate('/dictionaries')}
          >
            <ListItemText primary="Все справочники" />
          </ListItemButton>
        </List>
      </Collapse>

      <ListItemButton onClick={() => setStatisticsOpen(!statisticsOpen)}>
        <ListItemIcon>
          <BarChartIcon />
        </ListItemIcon>
        <ListItemText primary="Статистика" />
        {statisticsOpen ? <ExpandLess /> : <ExpandMore />}
      </ListItemButton>
      <Collapse in={statisticsOpen} timeout="auto" unmountOnExit>
        <List component="div" disablePadding>
          <ListItemButton
            sx={{ pl: 4 }}
            selected={isActive('/statistics')}
            onClick={() => navigate('/statistics')}
          >
            <ListItemText primary="Отчёты" />
          </ListItemButton>
        </List>
      </Collapse>
    </List>
  );
};
