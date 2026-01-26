import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Stack, Card, CardContent, CardActions, Typography, Chip, Tabs, Tab, Skeleton } from '@mui/material';
import { Add as AddIcon, FilterList as FilterListIcon, Edit as EditIcon } from '@mui/icons-material';
import { SearchField, ConfirmDialog, FilterDrawer, Pagination } from '../../components/ui/molecules';
import { Button, IconButton, Switch, Select } from '../../components/ui/atoms';
import { useDebounce, useConfirmDialog, useDrawer, useFilters } from '../../hooks';
import { useSnackbar } from 'notistack';
import { creativesApi, campaignsApi, advertisersApi } from '../../api';
import type { Creative, CreativeFormData, Campaign, Advertiser } from '../../types';
import { z } from 'zod';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog,
  DialogTitle,
  DialogContent,
} from '@mui/material';
import { FormField } from '../../components/ui/molecules';
import Editor from '@monaco-editor/react';

/**
 * Fetches raw HTML content without any modifications
 */
const fetchRawHtml = async (url: string): Promise<string | null> => {
  try {
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    
    // Try decoding as UTF-8
    let html = new TextDecoder('utf-8').decode(arrayBuffer);
    
    // Check if it contains mojibake patterns, try Windows-1252/Latin-1 instead
    if (/[ÃÂÕÖ]/.test(html) || html.includes('Â©') || html.includes('Â£')) {
      html = new TextDecoder('windows-1252').decode(arrayBuffer);
    }
    
    return html;
  } catch (error) {
    console.error('Error fetching raw HTML:', error);
    return null;
  }
};

/**
 * Fetches external HTML and fixes encoding issues
 */
const fetchAndFixHtml = async (url: string): Promise<string | null> => {
  try {
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    
    // Try decoding as UTF-8
    let html = new TextDecoder('utf-8').decode(arrayBuffer);
    
    // Check if it contains mojibake patterns, try Windows-1252/Latin-1 instead
    if (/[ÃÂÕÖ]/.test(html) || html.includes('Â©') || html.includes('Â£')) {
      html = new TextDecoder('windows-1252').decode(arrayBuffer);
    }
    
    // Inject CSS to remove body margins/padding
    const styleTag = '<style>body{margin:0;padding:0;overflow:hidden;width:100%;height:100%;}html{height:100%;}</style>';
    
    // Wrap content in a div with 100% dimensions
    const wrapContent = (content: string) => `<div style="height: 100%; width: 100%;">${content}</div>`;
    
    // Add UTF-8 charset if missing
    if (!html.includes('charset')) {
      if (html.includes('<head>') && html.includes('<body>')) {
        html = html.replace(/<head>/i, `<head><meta charset="UTF-8">${styleTag}`);
        html = html.replace(/<body>([\s\S]*?)<\/body>/i, (_match, content) => {
          return `<body>${wrapContent(content)}</body>`;
        });
      } else if (html.includes('<html>')) {
        html = html.replace(/<html>/i, `<html><head><meta charset="UTF-8">${styleTag}</head>`);
        if (html.includes('<body>')) {
          html = html.replace(/<body>([\s\S]*?)<\/body>/i, (_match, content) => {
            return `<body>${wrapContent(content)}</body>`;
          });
        }
      } else {
        html = `<!DOCTYPE html><html><head><meta charset="UTF-8">${styleTag}</head><body>${wrapContent(html)}</body></html>`;
      }
    } else {
      // Charset exists, just add style
      if (html.includes('</head>')) {
        html = html.replace(/<\/head>/i, `${styleTag}</head>`);
      } else if (html.includes('<head>')) {
        html = html.replace(/<head>/i, `<head>${styleTag}`);
      }
      
      if (html.includes('<body>')) {
        html = html.replace(/<body>([\s\S]*?)<\/body>/i, (_match, content) => {
          return `<body>${wrapContent(content)}</body>`;
        });
      }
    }
    
    return html;
  } catch (error) {
    console.error('Error fetching HTML:', error);
    return null;
  }
};

/**
 * Attempts to fix mojibake (garbled text) caused by incorrect encoding
 * Common issue: UTF-8 text interpreted as Latin-1
 */
const fixMojibake = (text: string): string => {
  try {
    // Check if text contains mojibake patterns (multiple combining characters, weird sequences)
    if (!/[\u0080-\u00FF]{2,}/.test(text)) {
      return text; // Doesn't look like mojibake
    }
    
    // Try to fix: encode as Latin-1 bytes, decode as UTF-8
    const latin1Bytes = new Uint8Array(
      [...text].map(char => char.charCodeAt(0) & 0xFF)
    );
    const fixed = new TextDecoder('utf-8').decode(latin1Bytes);
    
    // Verify the fix improved things (should have Armenian characters)
    if (/[\u0530-\u058F]/.test(fixed)) {
      return fixed;
    }
    
    return text; // Fix didn't help, return original
  } catch {
    return text;
  }
};

/**
 * Extracts HTML content from data URL for srcdoc
 * Returns null for non-HTML data URLs (will use src instead)
 */
const extractHtmlContent = (dataUrl: string): string | null => {
  if (!dataUrl.startsWith('data:text/html')) {
    return null; // Not an HTML data URL, use src attribute instead
  }

  try {
    const commaIndex = dataUrl.indexOf(',');
    if (commaIndex === -1) return null;
    
    const htmlContent = dataUrl.substring(commaIndex + 1);
    
    // Decode URL-encoded content
    let html: string;
    try {
      html = decodeURIComponent(htmlContent);
    } catch {
      html = htmlContent;
    }
    
    // Fix mojibake in the HTML content
    html = fixMojibake(html);
    
    // Inject CSS to remove body margins/padding and ensure full coverage
    const styleTag = '<style>body{margin:0;padding:0;overflow:hidden;width:100%;height:100%;}html{height:100%;}</style>';
    
    // Wrap content in a div with 100% dimensions
    const wrapContent = (content: string) => `<div style="height: 100%; width: 100%;">${content}</div>`;
    
    // Ensure UTF-8 charset in HTML
    if (!html.includes('charset')) {
      if (html.includes('<head>') && html.includes('<body>')) {
        // Full HTML structure exists
        html = html.replace(/<head>/i, `<head><meta charset="UTF-8">${styleTag}`);
        html = html.replace(/<body>([\s\S]*?)<\/body>/i, (_match, content) => {
          return `<body>${wrapContent(content)}</body>`;
        });
      } else if (html.includes('<html>')) {
        html = html.replace(/<html>/i, `<html><head><meta charset="UTF-8">${styleTag}</head>`);
        if (html.includes('<body>')) {
          html = html.replace(/<body>([\s\S]*?)<\/body>/i, (_match, content) => {
            return `<body>${wrapContent(content)}</body>`;
          });
        } else {
          html = html.replace(/<\/html>/i, `<body>${wrapContent('')}</body></html>`);
        }
      } else {
        html = `<!DOCTYPE html><html><head><meta charset="UTF-8">${styleTag}</head><body>${wrapContent(html)}</body></html>`;
      }
    } else {
      // Charset exists, just add style and wrap content
      if (html.includes('</head>')) {
        html = html.replace(/<\/head>/i, `${styleTag}</head>`);
      } else if (html.includes('<head>')) {
        html = html.replace(/<head>/i, `<head>${styleTag}`);
      }
      
      if (html.includes('<body>')) {
        html = html.replace(/<body>([\s\S]*?)<\/body>/i, (_match, content) => {
          return `<body>${wrapContent(content)}</body>`;
        });
      }
    }
    
    return html;
  } catch (error) {
    console.error('Error extracting HTML:', error);
    return null;
  }
};

const createCreativeSchema = (t: (key: string) => string) =>
  z.object({
    campaignId: z.number().min(1, t('creatives.validation.campaignRequired')),
    name: z.string().min(1, t('creatives.validation.nameRequired')),
    dataUrl: z.string().url(t('creatives.validation.dataUrlInvalid')),
    htmlContent: z.string().optional(),
    minHeight: z.number().min(0, t('creatives.validation.minHeightRequired')),
    maxHeight: z.number().min(0, t('creatives.validation.maxHeightRequired')),
    minWidth: z.number().min(0, t('creatives.validation.minWidthRequired')),
    maxWidth: z.number().min(0, t('creatives.validation.maxWidthRequired')),
    previewWidth: z.number().min(1, t('creatives.validation.previewWidthRequired')),
    previewHeight: z.number().min(1, t('creatives.validation.previewHeightRequired')),
    blocked: z.boolean(),
  });

type CreativeFormValues = z.infer<ReturnType<typeof createCreativeSchema>>;

export default function CreativesListPage() {
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const confirmDialog = useConfirmDialog();
  const filterDrawer = useDrawer();
  const [creatives, setCreatives] = useState<Creative[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [advertisers, setAdvertisers] = useState<Advertiser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 300);
  
  const { filters, updateFilter, resetFilters } = useFilters<{
    status: string;
    campaignId: number | string;
  }>({
    status: 'active',
    campaignId: '',
  });
  
  // Store fetched HTML content for external URLs
  const [htmlCache, setHtmlCache] = useState<Record<string, string>>({});
  const [htmlLoading, setHtmlLoading] = useState<Record<string, boolean>>({});
  const [htmlErrors, setHtmlErrors] = useState<Record<string, boolean>>({});
  
  // Pagination state
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(12);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCreative, setEditingCreative] = useState<Creative | null>(null);
  const [activeTab, setActiveTab] = useState(0);

  const schema = createCreativeSchema(t);
  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { isSubmitting },
  } = useForm<CreativeFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      campaignId: 0,
      name: '',
      dataUrl: '',
      htmlContent: '',
      minHeight: 0,
      maxHeight: 0,
      minWidth: 0,
      maxWidth: 0,
      previewWidth: 300,
      previewHeight: 200,
      blocked: false,
    },
  });
  
  // Watch form values for preview
  const formValues = useWatch({ control });

  const loadData = async () => {
    try {
      setLoading(true);
      const [creativesData, campaignsData, advertisersData] = await Promise.all([
        creativesApi.list(),
        campaignsApi.list(),
        advertisersApi.list(),
      ]);
      setCreatives(creativesData);
      setCampaigns(campaignsData);
      setAdvertisers(advertisersData);
    } catch (error) {
      enqueueSnackbar(t('common.error.loadFailed'), { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenDialog = async (creative?: Creative) => {
    if (creative) {
      setEditingCreative(creative);
      
      // Check if we need to load HTML from URL
      let htmlContentToUse = creative.htmlContent || '';
      
      // If no htmlContent but has external URL, try to load raw HTML
      if (!htmlContentToUse && creative.dataUrl.startsWith('http')) {
        const html = await fetchRawHtml(creative.dataUrl);
        if (html) {
          htmlContentToUse = html;
        }
      }
      
      reset({
        campaignId: creative.campaignId,
        name: creative.name,
        dataUrl: creative.dataUrl,
        htmlContent: htmlContentToUse,
        minHeight: creative.minHeight,
        maxHeight: creative.maxHeight,
        minWidth: creative.minWidth,
        maxWidth: creative.maxWidth,
        previewWidth: creative.previewWidth || 300,
        previewHeight: creative.previewHeight || 200,
        blocked: creative.blocked,
      });
    } else {
      setEditingCreative(null);
      reset({
        campaignId: 0,
        name: '',
        dataUrl: '',
        htmlContent: '',
        minHeight: 0,
        maxHeight: 0,
        minWidth: 0,
        maxWidth: 0,
        previewWidth: 300,
        previewHeight: 200,
        blocked: false,
      });
    }
    setActiveTab(0);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingCreative(null);
    setActiveTab(0);
    reset();
  };

  const handleFormSubmit = async (data: CreativeFormValues) => {
    try {
      const formData: CreativeFormData = {
        campaignId: data.campaignId,
        name: data.name,
        dataUrl: data.dataUrl,
        htmlContent: data.htmlContent,
        minHeight: Number(data.minHeight),
        maxHeight: Number(data.maxHeight),
        minWidth: Number(data.minWidth),
        maxWidth: Number(data.maxWidth),
        previewWidth: Number(data.previewWidth),
        previewHeight: Number(data.previewHeight),
        blocked: data.blocked,
      };

      if (editingCreative) {
        await creativesApi.update(editingCreative.id, formData);
        enqueueSnackbar(t('common.success.updated'), { variant: 'success' });
      } else {
        await creativesApi.create(formData);
        enqueueSnackbar(t('common.success.created'), { variant: 'success' });
      }

      handleCloseDialog();
      await loadData();
    } catch (error) {
      enqueueSnackbar(t('common.error.saveFailed'), { variant: 'error' });
    }
  };

  const handleBlock = useCallback(async (creative: Creative) => {
    const action = creative.blocked ? 'unblock' : 'block';
    confirmDialog.open({
      title: t(`creatives.confirm.${action}Title`),
      message: t(`creatives.confirm.${action}Message`, { name: creative.name }),      confirmText: t('common.confirm'),
      cancelText: t('common.cancel'),      onConfirm: async () => {
        try {
          await creativesApi.block(creative.id, !creative.blocked);
          enqueueSnackbar(t(`common.success.${action}ed`), { variant: 'success' });
          await loadData();
        } catch (error) {
          enqueueSnackbar(t('common.error.saveFailed'), { variant: 'error' });
        }
      },
    });
  }, [confirmDialog, t, enqueueSnackbar]);

  const getCampaignName = (campaignId: number) => {
    const campaign = campaigns.find(c => c.id === campaignId);
    return campaign ? campaign.name : '-';
  };

  const getAdvertiserName = (campaignId: number) => {
    const campaign = campaigns.find(c => c.id === campaignId);
    if (!campaign) return '-';
    const advertiser = advertisers.find(a => a.id === campaign.advertiserId);
    return advertiser ? advertiser.name : '-';
  };

  const filteredCreatives = creatives.filter((creative) => {
    // Search filter
    if (debouncedSearch) {
      const search = debouncedSearch.toLowerCase();
      const campaignName = getCampaignName(creative.campaignId).toLowerCase();
      const advertiserName = getAdvertiserName(creative.campaignId).toLowerCase();
      const matchesSearch = creative.name.toLowerCase().includes(search) ||
        campaignName.includes(search) ||
        advertiserName.includes(search);
      if (!matchesSearch) return false;
    }
    
    // Status filter
    if (filters.status === 'active' && creative.blocked) return false;
    if (filters.status === 'blocked' && !creative.blocked) return false;
    
    // Campaign filter
    if (filters.campaignId && creative.campaignId !== Number(filters.campaignId)) return false;
    
    return true;
  });
  
  // Pagination
  const totalPages = Math.ceil(filteredCreatives.length / rowsPerPage);
  const startIndex = (page - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginatedCreatives = filteredCreatives.slice(startIndex, endIndex);
  
  // Lazy load HTML for visible creatives
  useEffect(() => {
    const loadVisibleHtml = async () => {
      const promises = paginatedCreatives.map(async (creative) => {
        if (creative.dataUrl.startsWith('http') && !htmlCache[creative.dataUrl] && !htmlLoading[creative.dataUrl] && !htmlErrors[creative.dataUrl]) {
          setHtmlLoading(prev => ({ ...prev, [creative.dataUrl]: true }));
          try {
            const html = await fetchAndFixHtml(creative.dataUrl);
            if (html) {
              setHtmlCache(prev => ({ ...prev, [creative.dataUrl]: html }));
            } else {
              setHtmlErrors(prev => ({ ...prev, [creative.dataUrl]: true }));
            }
          } catch (error) {
            setHtmlErrors(prev => ({ ...prev, [creative.dataUrl]: true }));
          } finally {
            setHtmlLoading(prev => ({ ...prev, [creative.dataUrl]: false }));
          }
        }
      });
      await Promise.all(promises);
    };
    
    loadVisibleHtml();
  }, [page, rowsPerPage, filteredCreatives.length]);
  
  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, filters.status, filters.campaignId]);

  const campaignOptions = campaigns.map(c => ({ value: c.id, label: c.name }));

  if (loading) {
    return <Box sx={{ p: 3 }}>{t('common.loading')}</Box>;
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">{t('creatives.title')}</Typography>
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
            {t('creatives.addNew')}
          </Button>
        </Box>
      </Box>

      <Box sx={{ mb: 2 }}>
        <SearchField
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder={t('creatives.search')}
        />
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: 3,
        }}
      >
        {paginatedCreatives.map((creative) => (
          <Box key={creative.id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Box
                sx={{
                  height: 300,
                  bgcolor: 'grey.100',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                }}
              >
                <Box
                  sx={{
                    width: creative.previewWidth || 300,
                    height: creative.previewHeight || 200,
                    border: '1px solid',
                    borderColor: 'grey.300',
                    bgcolor: 'white',
                    overflow: 'hidden',
                    position: 'relative',
                  }}
                >
                {(() => {
                  // Priority 1: Use htmlContent if available
                  if (creative.htmlContent) {
                    return (
                      <iframe
                        srcDoc={creative.htmlContent}
                        style={{
                          width: '100%',
                          height: '100%',
                          border: 'none',
                          margin: 0,
                          padding: 0,
                          display: 'block',
                          position: 'absolute',
                          top: 0,
                          left: 0,
                        }}
                        title={creative.name}
                        sandbox="allow-scripts"
                      />
                    );
                  }
                  
                  // Priority 2: Check if loading HTML for external URL
                  if (creative.dataUrl.startsWith('http')) {
                    // Show error state if loading failed
                    if (htmlErrors[creative.dataUrl]) {
                      return (
                        <Box
                          sx={{
                            width: '100%',
                            height: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            bgcolor: 'grey.100',
                          }}
                        >
                          <Typography variant="caption" color="text.secondary">
                            No Image
                          </Typography>
                        </Box>
                      );
                    }
                    
                    if (htmlLoading[creative.dataUrl]) {
                      return (
                        <Skeleton
                          variant="rectangular"
                          width="100%"
                          height="100%"
                          animation="wave"
                          sx={{ position: 'absolute', top: 0, left: 0 }}
                        />
                      );
                    }
                    
                    const cachedHtml = htmlCache[creative.dataUrl];
                    if (cachedHtml) {
                      return (
                        <iframe
                          srcDoc={cachedHtml}
                          style={{
                            width: '100%',
                            height: '100%',
                            border: 'none',
                            margin: 0,
                            padding: 0,
                            display: 'block',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                          }}
                          title={creative.name}
                          sandbox="allow-scripts"
                        />
                      );
                    }
                  }
                  
                  // Priority 3: Try extracting from data: URL
                  const htmlContent = extractHtmlContent(creative.dataUrl);
                  return htmlContent ? (
                    <iframe
                      srcDoc={htmlContent}
                      style={{
                        width: '100%',
                        height: '100%',
                        border: 'none',
                        margin: 0,
                        padding: 0,
                        display: 'block',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                      }}
                      title={creative.name}
                      sandbox="allow-scripts"
                    />
                  ) : (
                    <iframe
                      src={creative.dataUrl}
                      style={{
                        width: '100%',
                        height: '100%',
                        border: 'none',
                        margin: 0,
                        padding: 0,
                        display: 'block',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                      }}
                      title={creative.name}
                      sandbox="allow-scripts"
                    />
                  );
                })()}
                </Box>
              </Box>
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h6" gutterBottom noWrap>
                  {creative.name}
                </Typography>
                <Stack spacing={0.5}>
                  <Typography variant="body2" color="text.secondary">
                    <strong>{t('creatives.fields.campaign')}:</strong> {getCampaignName(creative.campaignId)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    <strong>{t('creatives.fields.advertiser')}:</strong> {getAdvertiserName(creative.campaignId)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    <strong>{t('creatives.fields.resolution')}:</strong>{' '}
                    {creative.minWidth}x{creative.minHeight} - {creative.maxWidth}x{creative.maxHeight}
                  </Typography>
                </Stack>
                <Box sx={{ mt: 1 }}>
                  {creative.blocked && (
                    <Chip label={t('common.blocked')} color="error" size="small" />
                  )}
                </Box>
              </CardContent>
              <CardActions>
                <Stack direction="row" spacing={1} sx={{ width: '100%', justifyContent: 'space-between' }}>
                  <IconButton
                    icon={<EditIcon />}
                    size="small"
                    onClick={() => handleOpenDialog(creative)}
                    aria-label={t('common.edit')}
                  />
                  <Switch
                    checked={!creative.blocked}
                    onChange={() => handleBlock(creative)}
                  />
                </Stack>
              </CardActions>
            </Card>
          </Box>
        ))}
      </Box>

      {filteredCreatives.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="body1" color="text.secondary">
            {t('creatives.empty')}
          </Typography>
        </Box>
      )}
      
      {filteredCreatives.length > 0 && (
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
          <Pagination
            page={page}
            totalPages={totalPages}
            onPageChange={(newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(newRowsPerPage) => {
              setRowsPerPage(newRowsPerPage);
              setPage(1);
            }}
            rowsPerPageOptions={[6, 12, 24, 48]}
            totalCount={filteredCreatives.length}
          />
        </Box>
      )}

      <Dialog 
        open={dialogOpen} 
        onClose={handleCloseDialog} 
        maxWidth="lg" 
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
          {editingCreative ? t('creatives.editTitle') : t('creatives.addTitle')}
        </DialogTitle>
          
          <Tabs
            value={activeTab}
            onChange={(_, newValue) => setActiveTab(newValue)}
            sx={{ borderBottom: 1, borderColor: 'divider', px: 3, flexShrink: 0 }}
          >
            <Tab label={t('creatives.tabs.settings')} />
            <Tab label={t('creatives.tabs.htmlEditor')} />
            <Tab label={t('creatives.tabs.preview')} />
          </Tabs>
          
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
            {activeTab === 0 && (
              <Stack spacing={2} sx={{ mt: 1 }}>
                <FormField
                  name="campaignId"
                  control={control}
                  type="autocomplete"
                  label={t('creatives.fields.campaign')}
                  options={campaignOptions}
                  required
                />
                <FormField
                  name="name"
                  control={control}
                  type="text"
                  label={t('creatives.fields.name')}
                  required
                />
                <FormField
                  name="dataUrl"
                  control={control}
                  type="text"
                  label={t('creatives.fields.dataUrl')}
                  required
                  helperText={t('creatives.fields.dataUrlHelper')}
                />
                <Stack direction="row" spacing={2}>
                  <FormField
                    name="minWidth"
                    control={control}
                    type="number"
                    label={t('creatives.fields.minWidth')}
                    required
                  />
                  <FormField
                    name="maxWidth"
                    control={control}
                    type="number"
                    label={t('creatives.fields.maxWidth')}
                    required
                  />
                </Stack>
                <Stack direction="row" spacing={2}>
                  <FormField
                    name="minHeight"
                    control={control}
                    type="number"
                    label={t('creatives.fields.minHeight')}
                    required
                  />
                  <FormField
                    name="maxHeight"
                    control={control}
                    type="number"
                    label={t('creatives.fields.maxHeight')}
                    required
                  />
                </Stack>
                <Stack direction="row" spacing={2}>
                  <FormField
                    name="previewWidth"
                    control={control}
                    type="number"
                    label={t('creatives.fields.previewWidth')}
                    required
                  />
                  <FormField
                    name="previewHeight"
                    control={control}
                    type="number"
                    label={t('creatives.fields.previewHeight')}
                    required
                  />
                </Stack>
                <FormField
                  name="blocked"
                  control={control}
                  type="checkbox"
                  label={t('creatives.fields.blocked')}
                />
              </Stack>
            )}
            
            {activeTab === 1 && (
              <Box sx={{ height: 450, border: 1, borderColor: 'divider', borderRadius: 1, overflow: 'hidden' }}>
                <Editor
                  height="100%"
                  defaultLanguage="html"
                  value={formValues.htmlContent as string || ''}
                  onChange={(value) => setValue('htmlContent', value || '')}
                  theme="vs-dark"
                  options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    wordWrap: 'on',
                    automaticLayout: true,
                  }}
                />
              </Box>
            )}
            
            {activeTab === 2 && (
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  {t('creatives.preview.description')}
                </Typography>
                {(formValues.htmlContent || formValues.dataUrl) && (
                  <Box
                    sx={{
                      height: 300,
                      width: '100%',
                      bgcolor: 'grey.100',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      overflow: 'hidden',
                    }}
                  >
                    <Box
                      sx={{
                        width: formValues.previewWidth || 300,
                        height: formValues.previewHeight || 200,
                        border: '1px solid',
                        borderColor: 'grey.300',
                        bgcolor: 'white',
                        overflow: 'hidden',
                        position: 'relative',
                      }}
                    >
                      {(() => {
                        // Priority 1: Apply transformations to htmlContent if available
                        if (formValues.htmlContent) {
                          // Apply the same wrapping and fixes as fetchAndFixHtml does
                          const wrapContent = (content: string) => `<div style="height: 100%; width: 100%;">${content}</div>`;
                          const styleTag = '<style>body{margin:0;padding:0;overflow:hidden;width:100%;height:100%;}html{height:100%;}</style>';
                          
                          let html = formValues.htmlContent as string;
                          
                          // Apply charset and style fixes
                          if (!html.includes('charset')) {
                            if (html.includes('<head>') && html.includes('<body>')) {
                              html = html.replace(/<head>/i, `<head><meta charset="UTF-8">${styleTag}`);
                              html = html.replace(/<body>([\s\S]*?)<\/body>/i, (_match, content) => {
                                return `<body>${wrapContent(content)}</body>`;
                              });
                            } else if (html.includes('<html>')) {
                              html = html.replace(/<html>/i, `<html><head><meta charset="UTF-8">${styleTag}</head>`);
                              if (html.includes('<body>')) {
                                html = html.replace(/<body>([\s\S]*?)<\/body>/i, (_match, content) => {
                                  return `<body>${wrapContent(content)}</body>`;
                                });
                              }
                            } else {
                              html = `<!DOCTYPE html><html><head><meta charset="UTF-8">${styleTag}</head><body>${wrapContent(html)}</body></html>`;
                            }
                          } else {
                            if (html.includes('</head>')) {
                              html = html.replace(/<\/head>/i, `${styleTag}</head>`);
                            } else if (html.includes('<head>')) {
                              html = html.replace(/<head>/i, `<head>${styleTag}`);
                            }
                            
                            if (html.includes('<body>')) {
                              html = html.replace(/<body>([\s\S]*?)<\/body>/i, (_match, content) => {
                                return `<body>${wrapContent(content)}</body>`;
                              });
                            }
                          }
                          
                          return (
                            <iframe
                              srcDoc={html}
                              style={{
                                width: '100%',
                                height: '100%',
                                border: 'none',
                                margin: 0,
                                padding: 0,
                                display: 'block',
                                position: 'absolute',
                                top: 0,
                                left: 0,
                              }}
                              title="Preview"
                              sandbox="allow-scripts"
                            />
                          );
                        }
                        
                        // Priority 2: Check if we have cached HTML for external URL
                        const dataUrl = formValues.dataUrl as string;
                        if (dataUrl) {
                          const cachedHtml = htmlCache[dataUrl];
                          if (cachedHtml) {
                            return (
                              <iframe
                                srcDoc={cachedHtml}
                                style={{
                                  width: '100%',
                                  height: '100%',
                                  border: 'none',
                                  margin: 0,
                                  padding: 0,
                                  display: 'block',
                                  position: 'absolute',
                                  top: 0,
                                  left: 0,
                                }}
                                title="Preview"
                                sandbox="allow-scripts"
                              />
                            );
                          }
                          
                          // Priority 3: Try extracting from data: URL
                          const htmlContent = extractHtmlContent(dataUrl);
                          return htmlContent ? (
                            <iframe
                              srcDoc={htmlContent}
                              style={{
                                width: '100%',
                                height: '100%',
                                border: 'none',
                                margin: 0,
                                padding: 0,
                                display: 'block',
                                position: 'absolute',
                                top: 0,
                                left: 0,
                              }}
                              title="Preview"
                              sandbox="allow-scripts"
                            />
                          ) : (
                            <iframe
                              src={dataUrl}
                              style={{
                                width: '100%',
                                height: '100%',
                                border: 'none',
                                margin: 0,
                                padding: 0,
                                display: 'block',
                                position: 'absolute',
                                top: 0,
                                left: 0,
                              }}
                              title="Preview"
                              sandbox="allow-scripts"
                            />
                          );
                        }
                        
                        return null;
                      })()}
                    </Box>
                  </Box>
                )}
                {!formValues.htmlContent && !formValues.dataUrl && (
                  <Typography variant="body2" color="text.secondary">
                    {t('creatives.preview.empty')}
                  </Typography>
                )}
              </Box>
            )}
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

        <Select
          name="campaignId"
          label={t('creatives.fields.campaign')}
          value={filters.campaignId}
          onChange={(value) => updateFilter('campaignId', value ? Number(value) : '')}
          options={[
            { value: '', label: t('common.all') },
            ...campaignOptions,
          ]}
        />
      </FilterDrawer>

      <ConfirmDialog {...confirmDialog.dialogProps} />
    </Box>
  );
}
