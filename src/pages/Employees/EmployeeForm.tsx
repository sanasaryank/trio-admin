import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Typography,
  TextField,
  Button,
  FormControlLabel,
  Checkbox,
  Paper,
  Stack,
} from '@mui/material';
import { MainLayout } from '@/components/Layout/MainLayout';
import { employeesAPI } from '@/api/mock';
import type { EmployeeFormData } from '@/types';

/**
 * Employee create/edit form
 */
const EmployeeForm = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);

  const [formData, setFormData] = useState<EmployeeFormData>({
    firstName: '',
    lastName: '',
    blocked: false,
  });

  useEffect(() => {
    if (isEdit && id) {
      const employee = employeesAPI.getById(Number(id));
      if (employee) {
        setFormData({
          firstName: employee.firstName,
          lastName: employee.lastName,
          blocked: employee.blocked,
        });
      }
    }
  }, [id, isEdit]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (isEdit && id) {
      employeesAPI.update(Number(id), formData);
    } else {
      employeesAPI.create(formData);
    }

    navigate('/employees');
  };

  const handleCancel = () => {
    navigate('/employees');
  };

  return (
    <MainLayout title={isEdit ? 'Редактирование сотрудника' : 'Новый сотрудник'}>
      <Box sx={{ maxWidth: 600 }}>
        <Typography variant="h4" gutterBottom>
          {isEdit ? 'Редактирование сотрудника' : 'Новый сотрудник'}
        </Typography>

        <Paper sx={{ p: 3, mt: 3 }}>
          <form onSubmit={handleSubmit}>
            <Stack spacing={3}>
              <TextField
                label="Имя"
                required
                fullWidth
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              />

              <TextField
                label="Фамилия"
                required
                fullWidth
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              />

              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.blocked}
                    onChange={(e) => setFormData({ ...formData, blocked: e.target.checked })}
                  />
                }
                label="Заблокирован"
              />

              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button variant="outlined" onClick={handleCancel}>
                  Отмена
                </Button>
                <Button type="submit" variant="contained">
                  Сохранить
                </Button>
              </Box>
            </Stack>
          </form>
        </Paper>
      </Box>
    </MainLayout>
  );
};

export default EmployeeForm;
