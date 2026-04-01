import React, { type ReactNode, type RefObject } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Box,
  type SxProps,
  type Theme,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';

export const dialogLayout = {
  paper: {
    display: 'flex',
    flexDirection: 'column' as const,
    height: '90vh',
    maxHeight: '90vh',
    borderRadius: 3,
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    pb: 2,
    borderBottom: '1px solid',
    borderColor: 'divider',
    flexShrink: 0,
    flexWrap: 'wrap',
    gap: 1,
  },
  closeButton: {
    color: 'text.secondary',
    '&:hover': { bgcolor: 'action.hover' },
  },
  content: {
    pt: 3,
    pb: 0,
    flexGrow: 1,
    overflow: 'auto',
    display: 'flex',
    flexDirection: 'column' as const,
  },
  footer: {
    flexShrink: 0,
    px: 3,
    py: 2,
    borderTop: '1px solid',
    borderColor: 'divider',
    bgcolor: 'background.paper',
    display: 'flex',
    justifyContent: 'flex-end',
    gap: 2,
    flexWrap: 'wrap',
  },
} as const;

export interface FormDialogLayoutProps {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  children: ReactNode;
  footer: ReactNode;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  fullWidth?: boolean;
  /** When true, disables backdrop click, ESC key, and close button (e.g. while submitting) */
  disableClose?: boolean;
  /** Optional Paper sx overrides (e.g. for smaller dialogs without fixed height) */
  paperSx?: SxProps<Theme>;
  'aria-labelledby'?: string;
  /** Optional ref for the scrollable content area (e.g. for scroll-to-first-error) */
  contentRef?: RefObject<HTMLDivElement | null>;
}

export const FormDialogLayout: React.FC<FormDialogLayoutProps> = ({
  open,
  onClose,
  title,
  children,
  footer,
  maxWidth = 'sm',
  fullWidth = true,
  disableClose = false,
  paperSx,
  'aria-labelledby': ariaLabelledBy,
  contentRef,
}) => (
  <Dialog
    open={open}
    onClose={(_event, reason) => {
      if (disableClose) return;
      if (reason !== 'backdropClick') {
        onClose();
      }
    }}
    disableEscapeKeyDown={disableClose}
    maxWidth={maxWidth}
    fullWidth={fullWidth}
    aria-labelledby={ariaLabelledBy}
    PaperProps={{
      sx: { ...dialogLayout.paper, ...(paperSx ?? {}) },
    }}
  >
    <DialogTitle id={ariaLabelledBy} sx={dialogLayout.header} component="div">
      {title}
      <IconButton
        aria-label="close"
        onClick={disableClose ? undefined : onClose}
        disabled={disableClose}
        sx={dialogLayout.closeButton}
      >
        <CloseIcon />
      </IconButton>
    </DialogTitle>
    <DialogContent ref={contentRef} sx={dialogLayout.content}>{children}</DialogContent>
    <Box sx={dialogLayout.footer} component="footer">
      {footer}
    </Box>
  </Dialog>
);

FormDialogLayout.displayName = 'FormDialogLayout';
