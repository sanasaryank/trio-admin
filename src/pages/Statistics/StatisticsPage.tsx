import { Accordion, AccordionSummary, AccordionDetails, Typography, Box } from '@mui/material';
import { ExpandMore as ExpandMoreIcon } from '@mui/icons-material';
import { MainLayout } from '@/components/Layout/MainLayout';

/**
 * Statistics page with placeholder sections
 */
const StatisticsPage = () => {
  const sections = [
    { id: 'actions', title: 'Действия сотрудников' },
    { id: 'usage', title: 'Использование' },
    { id: 'errors', title: 'Журнал ошибок' },
  ];

  return (
    <MainLayout title="Статистика">
      <Typography variant="h4" gutterBottom>
        Статистика
      </Typography>

      {sections.map((section) => (
        <Accordion key={section.id}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">{section.title}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: 200,
              }}
            >
              <Typography variant="h5" color="text.secondary">
                Coming soon
              </Typography>
            </Box>
          </AccordionDetails>
        </Accordion>
      ))}
    </MainLayout>
  );
};

export default StatisticsPage;
