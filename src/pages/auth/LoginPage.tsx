import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Box,
  TextField as MuiTextField,
  Button,
  Typography,
  Alert,
} from '@mui/material';
import { useAuthStore } from '../../store/authStore';
import { useAppSnackbar } from '../../providers/AppSnackbarProvider';
import { getErrorMessage } from '../../api/errors';
import TextField from '../../components/ui/atoms/TextField';
import { LanguageSwitcher } from '../../components/common/LanguageSwitcher';

export const LoginPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { login, isLoading } = useAuthStore();
  const { showError } = useAppSnackbar();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [localErrorKey, setLocalErrorKey] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalErrorKey(null);

    if (!username || !password) {
      setLocalErrorKey('auth.fillAllFields');
      return;
    }

    try {
      await login({ username, password });
      navigate('/');
    } catch (err) {
      showError(getErrorMessage(err));
    }
  };

  const displayedError = localErrorKey ? t(localErrorKey) : null;

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Left side - Login Form */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          px: 4,
          py: 8,
          bgcolor: 'background.paper',
        }}
      >
        <Box sx={{ width: '100%', maxWidth: 400 }}>
          {/* Logo */}
          <Box sx={{ mb: 4, textAlign: 'left' }}>
            <img
              src={`${import.meta.env.BASE_URL}logo.svg`}
              alt="TRIO"
              style={{ height: 32, marginBottom: 16 }}
            />
          </Box>

          {/* Title */}
          <Typography
            variant="h5"
            sx={{
              fontWeight: 700,
              color: 'text.primary',
              mb: 1,
            }}
          >
            {t('auth.login')}
          </Typography>

          <Typography
            variant="body2"
            sx={{
              color: 'text.secondary',
              mb: 4,
            }}
          >
            {t('auth.signIn')}
          </Typography>

          {/* Error Alert with high fidelity UI/UX */}
          <Box sx={{ mb: displayedError ? 3 : 0, minHeight: displayedError ? 'auto' : 0 }}>
            {displayedError && (
              <Alert 
                severity="error" 
                variant="outlined"
                sx={{ 
                  borderRadius: 2,
                  borderWidth: 2,
                  animation: 'fadeInSlide 0.3s ease-out',
                  '@keyframes fadeInSlide': {
                    '0%': { opacity: 0, transform: 'translateY(-10px)' },
                    '100%': { opacity: 1, transform: 'translateY(0)' },
                  },
                }}
              >
                {displayedError}
              </Alert>
            )}
          </Box>

          {/* Login Form */}
          <Box component="form" onSubmit={handleSubmit} noValidate>
            <MuiTextField
              margin="normal"
              required
              fullWidth
              id="username"
              label={t('auth.email')}
              name="username"
              autoComplete="username"
              autoFocus
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={isLoading}
              sx={{ mb: 2 }}
            />
            <Box sx={{ mb: 1 }}>
              <TextField
                name="password"
                label={t('auth.password')}
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                required
                fullWidth
              />
            </Box>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{
                mt: 3,
                py: 1.5,
                fontSize: '1rem',
                fontWeight: 600,
                textTransform: 'none',
              }}
              disabled={isLoading}
            >
              {isLoading ? t('common.loading') : t('auth.signIn')}
            </Button>
          </Box>

          {/* Language Selector */}
          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-start' }}>
            <LanguageSwitcher showShortCode={true} />
          </Box>
        </Box>
      </Box>

      {/* Right side - Brand Section */}
      <Box
        sx={{
          flex: 1,
          display: { xs: 'none', md: 'flex' },
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          bgcolor: 'primary.main',
          color: 'white',
          px: 8,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Background Pattern */}
        <Box
          sx={{
            position: 'absolute',
            top: -100,
            right: -100,
            width: 400,
            height: 400,
            borderRadius: '50%',
            bgcolor: 'rgba(255, 255, 255, 0.1)',
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            bottom: -150,
            left: -150,
            width: 500,
            height: 500,
            borderRadius: '50%',
            bgcolor: 'rgba(255, 255, 255, 0.05)',
          }}
        />

        {/* Content */}
        <Box sx={{ position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: 500 }}>
          <Typography
            variant="h3"
            sx={{
              fontWeight: 700,
              mb: 3,
              fontSize: { xs: '2rem', md: '2.5rem' },
            }}
          >
            {t('auth.brandTitle')}
          </Typography>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 600,
              mb: 2,
              fontSize: { xs: '1.1rem', md: '1.25rem' },
            }}
          >
            {t('auth.brandSubtitle')}
          </Typography>
          <Typography
            variant="body1"
            sx={{
              opacity: 0.9,
              lineHeight: 1.7,
              fontSize: { xs: '0.9rem', md: '1rem' },
            }}
          >
            {t('auth.brandDescription')}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};
