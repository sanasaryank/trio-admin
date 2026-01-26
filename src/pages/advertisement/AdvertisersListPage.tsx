import { useState, useEffect, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Stack, Typography } from '@mui/material';
import { Add as AddIcon, FilterList as FilterListIcon, Edit as EditIcon } from '@mui/icons-material';
import { DataTable, SearchField, Pagination, ConfirmDialog, FilterDrawer } from '../../components/ui/molecules';
import type { Column } from '../../components/ui/molecules/DataTable';
import { Button, IconButton, Switch, Select } from '../../components/ui/atoms';
import { useTableState, useDebounce, useConfirmDialog, useDrawer, useFilters } from '../../hooks';
import { useSnackbar } from 'notistack';
import { advertisersApi } from '../../api';
import type { Advertiser, AdvertiserFormData } from '../../types';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog,
  DialogTitle,
  DialogContent,
} from '@mui/material';
import { FormField } from '../../components/ui/molecules';

const createAdvertiserSchema = (t: (key: string) => string) =>
  z.object({
    name: z.string().min(1, t('advertisers.validation.nameRequired')),
    tin: z.string().min(1, t('advertisers.validation.tinRequired')),
    blocked: z.boolean(),
  });

type AdvertiserFormValues = z.infer<ReturnType<typeof createAdvertiserSchema>>;

export default function AdvertisersListPage() {
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const confirmDialog = useConfirmDialog();
  const filterDrawer = useDrawer();
  const [advertisers, setAdvertisers] = useState<Advertiser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 300);
  
  const { filters, updateFilter, resetFilters } = useFilters<{ status: string }>({
    status: 'active',
  });

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAdvertiser, setEditingAdvertiser] = useState<Advertiser | null>(null);

  const schema = createAdvertiserSchema(t);
  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<AdvertiserFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      tin: '',
      blocked: false,
    },
  });

  const loadAdvertisers = async () => {
    try {
      setLoading(true);
      const data = await advertisersApi.list();
      setAdvertisers(data);
    } catch (error) {
      enqueueSnackbar(t('common.error.loadFailed'), { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdvertisers();
  }, []);

  const handleOpenDialog = (advertiser?: Advertiser) => {
    if (advertiser) {
      setEditingAdvertiser(advertiser);
      reset({
        name: advertiser.name,
        tin: advertiser.tin,
        blocked: advertiser.blocked,
      });
    } else {
      setEditingAdvertiser(null);
      reset({
        name: '',
        tin: '',
        blocked: false,
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingAdvertiser(null);
    reset();
  };

  const handleFormSubmit = async (data: AdvertiserFormValues) => {
    try {
      const formData: AdvertiserFormData = {
        name: data.name,
        tin: data.tin,
        blocked: data.blocked,
      };

      if (editingAdvertiser) {
        await advertisersApi.update(editingAdvertiser.id, formData);
        enqueueSnackbar(t('common.success.updated'), { variant: 'success' });
      } else {
        await advertisersApi.create(formData);
        enqueueSnackbar(t('common.success.created'), { variant: 'success' });
      }

      handleCloseDialog();
      await loadAdvertisers();
    } catch (error) {
      enqueueSnackbar(t('common.error.saveFailed'), { variant: 'error' });
    }
  };

  const filteredAdvertisers = advertisers.filter((advertiser) => {
    // Search filter
    if (debouncedSearch) {
      const search = debouncedSearch.toLowerCase();
      const matchesSearch = advertiser.name.toLowerCase().includes(search) ||
        advertiser.tin.toLowerCase().includes(search);
      if (!matchesSearch) return false;
    }
    
    // Status filter
    if (filters.status === 'active' && advertiser.blocked) return false;
    if (filters.status === 'blocked' && !advertiser.blocked) return false;
    
    return true;
  });

  const tableState = useTableState<Advertiser>({
    data: filteredAdvertisers,
    initialRowsPerPage: 10,
    defaultSortColumn: 'name' as keyof Advertiser,
    defaultSortDirection: 'asc',
  });

  const handleBlock = useCallback(
    async (advertiser: Advertiser) => {
      const action = advertiser.blocked ? 'unblock' : 'block';
      confirmDialog.open({
        title: t(`advertisers.confirm.${action}Title`),
        message: t(`advertisers.confirm.${action}Message`, { name: advertiser.name }),
        confirmText: t('common.confirm'),
        cancelText: t('common.cancel'),
        onConfirm: async () => {
          try {
            await advertisersApi.block(advertiser.id, !advertiser.blocked);
            enqueueSnackbar(t(`common.success.${action}ed`), { variant: 'success' });
            await loadAdvertisers();
          } catch (error) {
            enqueueSnackbar(t('common.error.saveFailed'), { variant: 'error' });
          }
        },
      });
    },
    [t, enqueueSnackbar, confirmDialog]
  );

  const columns = useMemo<Column<Advertiser>[]>(
    () => [
      {
        id: 'name',
        label: t('advertisers.fields.name'),
        sortable: true,
        render: (advertiser) => advertiser.name,
      },
      {
        id: 'tin',
        label: t('advertisers.fields.tin'),
        sortable: false,
        render: (advertiser) => advertiser.tin,
      },
      {
        id: 'actions',
        label: t('common.actions'),
        sortable: false,
        align: 'right',
        render: (advertiser) => (
          <Stack direction="row" spacing={1} justifyContent="flex-end">
            <IconButton
              icon={<EditIcon />}
              size="small"
              onClick={() => handleOpenDialog(advertiser)}
              aria-label={t('common.edit')}
            />
            <Switch
              checked={!advertiser.blocked}
              onChange={() => handleBlock(advertiser)}
            />
          </Stack>
        ),
      },
    ],
    [t, handleBlock, handleOpenDialog]
  );

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">{t('advertisers.title')}</Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<FilterListIcon />}
            onClick={filterDrawer.open}
          >
            {t('common.filters')}
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            {t('advertisers.addNew')}
          </Button>
        </Box>
      </Box>

      <Box sx={{ mb: 2 }}>
        <SearchField
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder={t('advertisers.search')}
        />
      </Box>

      <DataTable<Advertiser>
        columns={columns}
        data={tableState.paginatedData}
        loading={loading}
        sortColumn={tableState.sortColumn ?? undefined}
        sortDirection={tableState.sortDirection}
        onSort={(column) => tableState.handleSort(column as keyof Advertiser)}
        rowKey="id"
      />

      <Pagination
        page={tableState.page}
        totalPages={tableState.totalPages}
        onPageChange={tableState.handlePageChange}
        rowsPerPage={tableState.rowsPerPage}
        onRowsPerPageChange={tableState.handleRowsPerPageChange}
        rowsPerPageOptions={[5, 10, 25]}
        totalCount={filteredAdvertisers.length}
      />

      <Dialog 
        open={dialogOpen} 
        onClose={handleCloseDialog} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: {
            height: '90vh',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
          },
        }}
      >
        <DialogTitle sx={{ flexShrink: 0 }}>
          {editingAdvertiser ? t('advertisers.editTitle') : t('advertisers.addTitle')}
        </DialogTitle>
        <DialogContent
          sx={{
            pt: 3,
            pb: 0,
            flexGrow: 1,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Box component="form" onSubmit={handleSubmit(handleFormSubmit)} sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <Box sx={{ flexGrow: 1, overflow: 'auto', pb: 2 }}>
              <Stack spacing={2} sx={{ mt: 1 }}>
                <FormField
                  name="name"
                  control={control}
                  type="text"
                  label={t('advertisers.fields.name')}
                  required
                />
                <FormField
                  name="tin"
                  control={control}
                  type="text"
                  label={t('advertisers.fields.tin')}
                  required
                />
                <FormField
                  name="blocked"
                  control={control}
                  type="checkbox"
                  label={t('advertisers.fields.blocked')}
                />
              </Stack>
            </Box>
            <Box
              sx={{
                flexShrink: 0,
                px: 3,
                py: 2,
                borderTop: '1px solid',
                borderColor: 'divider',
                bgcolor: 'background.paper',
                display: 'flex',
                justifyContent: 'flex-end',
                gap: 2,
                position: 'sticky',
                bottom: 0,
              }}
            >
              <Button onClick={handleCloseDialog} variant="outlined" disabled={isSubmitting}>
                {t('common.cancel')}
              </Button>
              <Button type="submit" variant="contained" disabled={isSubmitting}>
                {t('common.save')}
              </Button>
            </Box>
          </Box>
        </DialogContent>
      </Dialog>

      <FilterDrawer
        open={filterDrawer.isOpen}
        onClose={filterDrawer.close}
        onApply={() => filterDrawer.close()}
        onReset={resetFilters}
        title={t('common.filters')}
      >
        <Select
          name="status"
          label={t('common.status')}
          value={filters.status}
          onChange={(value) => updateFilter('status', value as 'active' | 'blocked' | 'all')}
          options={[
            { value: 'all', label: t('common.all') },
            { value: 'active', label: t('common.active') },
            { value: 'blocked', label: t('common.blocked') },
          ]}
        />
      </FilterDrawer>

      <ConfirmDialog {...confirmDialog.dialogProps} />
    </Box>
  );
}
