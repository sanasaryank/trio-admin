import { useState, type ReactNode } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { logger } from '../utils/logger';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  Button,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Restaurant as RestaurantIcon,
  Book as BookIcon,
  BarChart as BarChartIcon,
  ExpandLess,
  ExpandMore,
  Logout as LogoutIcon,
} from '@mui/icons-material';
import { useAuthStore } from '../store/authStore';
import { LanguageSwitcher } from '../components/common/LanguageSwitcher';

const DRAWER_WIDTH = 280;

interface MenuItem {
  id: string;
  labelKey: string;
  icon: ReactNode;
  path?: string;
  children?: MenuItem[];
}

const getMenuItems = (): MenuItem[] => [
  {
    id: 'restaurants',
    labelKey: 'menu.restaurants',
    icon: <RestaurantIcon />,
    path: '/restaurants',
  },
  {
    id: 'dictionaries',
    labelKey: 'menu.dictionaries',
    icon: <BookIcon />,
    children: [
      { id: 'employees', labelKey: 'menu.employees', icon: null, path: '/employees' },
      { id: 'restaurant-types', labelKey: 'menu.restaurantTypes', icon: null, path: '/dictionaries/restaurant-types' },
      { id: 'price-segments', labelKey: 'menu.priceSegments', icon: null, path: '/dictionaries/price-segments' },
      { id: 'menu-types', labelKey: 'menu.menuTypes', icon: null, path: '/dictionaries/menu-types' },
      { id: 'integration-types', labelKey: 'menu.integrationTypes', icon: null, path: '/dictionaries/integration-types' },
      { id: 'countries', labelKey: 'menu.countries', icon: null, path: '/dictionaries/countries' },
      { id: 'cities', labelKey: 'menu.cities', icon: null, path: '/dictionaries/cities' },
      { id: 'districts', labelKey: 'menu.districts', icon: null, path: '/dictionaries/districts' },
    ],
  },
  {
    id: 'statistics',
    labelKey: 'menu.statistics',
    icon: <BarChartIcon />,
    children: [
      { id: 'staff-actions', labelKey: 'menu.staffActions', icon: null, path: '/statistics/staff-actions' },
      { id: 'usage', labelKey: 'menu.usage', icon: null, path: '/statistics/usage' },
      { id: 'error-log', labelKey: 'menu.errorLog', icon: null, path: '/statistics/error-log' },
    ],
  },
];

export const MainLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const { user, logout } = useAuthStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});

  const menuItems = getMenuItems();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleItemClick = (item: MenuItem) => {
    if (item.children) {
      setExpandedItems((prev) => ({
        ...prev,
        [item.id]: !prev[item.id],
      }));
    } else if (item.path) {
      navigate(item.path);
      setMobileOpen(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      logger.error('Logout failed', error as Error);
    }
  };

  const renderMenuItem = (item: MenuItem, depth = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems[item.id];
    const isActive = item.path && location.pathname.startsWith(item.path);

    return (
      <Box key={item.id}>
        <ListItem disablePadding sx={{ pl: depth * 2 }}>
          <ListItemButton
            onClick={() => handleItemClick(item)}
            sx={{
              '&:hover': {
                bgcolor: 'action.hover',
              },
              ...(isActive && {
                bgcolor: 'action.selected',
                '&:hover': {
                  bgcolor: 'action.selected',
                },
              }),
            }}
          >
            {item.icon && (
              <ListItemIcon
                sx={{
                  color: isActive ? 'primary.main' : 'inherit',
                }}
              >
                {item.icon}
              </ListItemIcon>
            )}
            <ListItemText
              primary={t(item.labelKey)}
              sx={{
                pl: !item.icon && depth > 0 ? 2 : 0,
                '& .MuiListItemText-primary': {
                  color: isActive ? 'primary.main' : 'inherit',
                  fontWeight: isActive ? 600 : 400,
                },
              }}
            />
            {hasChildren && (isExpanded ? <ExpandLess /> : <ExpandMore />)}
          </ListItemButton>
        </ListItem>
        {hasChildren && (
          <Collapse in={isExpanded} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {item.children!.map((child) => renderMenuItem(child, depth + 1))}
            </List>
          </Collapse>
        )}
      </Box>
    );
  };

  const drawer = (
    <Box>
      <Toolbar sx={{ justifyContent: 'center', py: 3 }}>
        <img
          src="/logo.svg"
          alt="TRIO"
          style={{ height: 32 }}
        />
      </Toolbar>
      <Divider />
      <List sx={{ px: 2 }}>
        {menuItems.map((item) => renderMenuItem(item))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${DRAWER_WIDTH}px)` },
          ml: { sm: `${DRAWER_WIDTH}px` },
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Box sx={{ flexGrow: 1 }} />
          <LanguageSwitcher />
          <Typography variant="body1" sx={{ mx: 2 }}>
            {user?.firstName} {user?.lastName}
          </Typography>
          <Button
            color="inherit"
            startIcon={<LogoutIcon />}
            onClick={handleLogout}
          >
            {t('common.logout')}
          </Button>
        </Toolbar>
      </AppBar>

      <Box
        component="nav"
        sx={{ width: { sm: DRAWER_WIDTH }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: DRAWER_WIDTH,
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: DRAWER_WIDTH,
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${DRAWER_WIDTH}px)` },
          minHeight: '100vh',
          bgcolor: 'background.default',
        }}
      >
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
};
