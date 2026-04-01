import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { IconButton, Menu, MenuItem, ListItemText, Box, Typography } from '@mui/material';
import { useState } from 'react';

const languages = [
  { code: 'hy', name: 'Հայերեն', countryCode: 'am', shortCode: 'ARM' },
  { code: 'ru', name: 'Русский', countryCode: 'ru', shortCode: 'RUS' },
  { code: 'en', name: 'English', countryCode: 'us', shortCode: 'ENG' },
];

const FlagImage = ({ countryCode, name }: { countryCode: string; name: string }) => {
  // Map some country codes if necessary (e.g. 'us' or other overrides)
  const code = countryCode.toLowerCase();
  
  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Box
        component="img"
        src={`https://hatscripts.github.io/circle-flags/flags/${code}.svg`}
        alt={`${name} flag`}
        sx={{
          width: '100%',
          height: '100%',
          display: 'block',
          borderRadius: '50%',
        }}
      />
    </Box>
  );
};

export const LanguageSwitcher = ({ showShortCode = false }: { showShortCode?: boolean }) => {
  const { i18n } = useTranslation();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLanguageChange = useCallback(
    (languageCode: string) => {
      i18n.changeLanguage(languageCode);
      localStorage.setItem('language', languageCode);
      handleClose();
    },
    [i18n]
  );

  const currentLanguage = languages.find((lang) => lang.code === i18n.language) || languages[0];

  return (
    <>
      <IconButton
        onClick={handleClick}
        color="inherit"
        size="small"
        sx={{
          display: 'flex',
          gap: 1,
          px: 1,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 28,
            height: 28,
          }}
        >
          <FlagImage 
            countryCode={currentLanguage.countryCode} 
            name={currentLanguage.name} 
          />
        </Box>
        {showShortCode && (
          <Typography 
            variant="body2" 
            sx={{ 
              ml: 1, 
              fontSize: '0.75rem', 
              fontWeight: 600, 
              color: 'text.secondary',
              letterSpacing: '0.05em'
            }}
          >
            {currentLanguage.shortCode}
          </Typography>
        )}
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        {languages.map((language) => (
          <MenuItem
            key={language.code}
            onClick={() => handleLanguageChange(language.code)}
            selected={language.code === i18n.language}
          >
            <Box 
              sx={{ 
                mr: 2, 
                display: 'flex', 
                alignItems: 'center',
                width: 24,
                height: 24,
              }}
            >
              <FlagImage 
                countryCode={language.countryCode} 
                name={language.name} 
              />
            </Box>
            <ListItemText>{language.name}</ListItemText>
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};
