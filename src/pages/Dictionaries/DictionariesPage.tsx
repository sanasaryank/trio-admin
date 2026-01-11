import { Accordion, AccordionSummary, AccordionDetails, Typography } from '@mui/material';
import { ExpandMore as ExpandMoreIcon } from '@mui/icons-material';
import { MainLayout } from '@/components/Layout/MainLayout';
import { DictionarySection } from './DictionarySection';

/**
 * Dictionaries page with accordion sections
 */
const DictionariesPage = () => {
  const dictionaries = [
    { type: 'countries' as const, title: 'Страны' },
    { type: 'cities' as const, title: 'Города' },
    { type: 'districts' as const, title: 'Районы' },
    { type: 'restaurantTypes' as const, title: 'Типы ресторанов' },
    { type: 'priceSegments' as const, title: 'Ценовые сегменты' },
    { type: 'menuTypes' as const, title: 'Типы меню' },
    { type: 'integrationTypes' as const, title: 'Типы интеграций' },
  ];

  return (
    <MainLayout title="Справочники">
      <Typography variant="h4" gutterBottom>
        Справочники
      </Typography>

      {dictionaries.map((dict) => (
        <Accordion key={dict.type} defaultExpanded={dict.type === 'countries'}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">{dict.title}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <DictionarySection dictionaryType={dict.type} title={dict.title} />
          </AccordionDetails>
        </Accordion>
      ))}
    </MainLayout>
  );
};

export default DictionariesPage;
