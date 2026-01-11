import { GridColDef } from '@mui/x-data-grid';
import { Box, Typography, IconButton, Chip } from '@mui/material';
import { Block as BlockIcon } from '@mui/icons-material';
import { DataTable } from '@/components/common/DataTable';
import { dictionariesAPI } from '@/api/mock';
import type { DictionaryType, DictionaryItem } from '@/types';
import { formatTimestamp } from '@/utils/dateFormat';
import { useState, useEffect } from 'react';

interface DictionarySectionProps {
  dictionaryType: DictionaryType;
  title: string;
}

/**
 * Reusable dictionary section component
 */
export const DictionarySection = ({ dictionaryType, title }: DictionarySectionProps) => {
  const [items, setItems] = useState<DictionaryItem[]>([]);

  const loadItems = () => {
    const data = dictionariesAPI.getAll(dictionaryType);
    setItems(data);
  };

  useEffect(() => {
    loadItems();
  }, [dictionaryType]);

  const handleToggleBlock = (id: number) => {
    dictionariesAPI.toggleBlock(dictionaryType, id);
    loadItems();
  };

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'name', headerName: 'Название', flex: 1 },
    {
      field: 'blocked',
      headerName: 'Статус',
      width: 120,
      renderCell: (params) => (
        <Chip
          label={params.value ? 'Заблокирован' : 'Активен'}
          color={params.value ? 'error' : 'success'}
          size="small"
        />
      ),
    },
    {
      field: 'createdAt',
      headerName: 'Создан',
      width: 150,
      valueFormatter: (value) => formatTimestamp(value),
    },
    {
      field: 'actions',
      headerName: 'Действия',
      width: 100,
      sortable: false,
      renderCell: (params) => (
        <Box>
          <IconButton
            size="small"
            onClick={() => handleToggleBlock(params.row.id)}
            title={params.row.blocked ? 'Разблокировать' : 'Заблокировать'}
          >
            <BlockIcon fontSize="small" />
          </IconButton>
        </Box>
      ),
    },
  ];

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>
      <DataTable rows={items} columns={columns} />
    </Box>
  );
};
