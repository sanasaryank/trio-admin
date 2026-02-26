import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { logger } from '../utils/logger';

interface BlockableItem {
  id: string;
  isBlocked: boolean;
}

interface UseBlockToggleOptions<T extends BlockableItem> {
  confirmDialog: {
    open: (config: {
      title: string;
      message: string;
      confirmText: string;
      cancelText: string;
      onConfirm: () => void | Promise<void>;
    }) => void;
  };
  blockApi: (id: string, isBlocked: boolean) => Promise<T>;
  onSuccess?: () => void | Promise<void>;
  getItemName: (item: T) => string;
  translationKeys?: {
    blockTitle?: string;
    unblockTitle?: string;
    blockMessage?: string;
    unblockMessage?: string;
  };
  logContext?: string;
}

/**
 * Reusable hook for handling block/unblock toggle with confirmation dialog
 * Handles the common pattern of:
 * 1. Show confirmation dialog
 * 2. Call API to block/unblock
 * 3. Refresh data on success
 * 4. Log errors
 */
export const useBlockToggle = <T extends BlockableItem>({
  confirmDialog,
  blockApi,
  onSuccess,
  getItemName,
  translationKeys = {},
  logContext = 'useBlockToggle',
}: UseBlockToggleOptions<T>) => {
  const { t } = useTranslation();

  const {
    blockTitle = 'common.blockConfirmTitle',
    unblockTitle = 'common.unblockConfirmTitle',
    blockMessage = 'common.blockConfirmMessage',
    unblockMessage = 'common.unblockConfirmMessage',
  } = translationKeys;

  const handleBlockToggle = useCallback(
    (item: T) => {
      const itemName = getItemName(item);

      confirmDialog.open({
        title: item.isBlocked ? t(unblockTitle) : t(blockTitle),
        message: item.isBlocked
          ? t(unblockMessage, { name: itemName })
          : t(blockMessage, { name: itemName }),
        confirmText: t('common.confirm'),
        cancelText: t('common.cancel'),
        onConfirm: async () => {
          try {
            await blockApi(item.id, !item.isBlocked);
            if (onSuccess) {
              await onSuccess();
            }
          } catch (err) {
            logger.error('Error toggling block status', err as Error, {
              context: logContext,
              itemId: item.id,
              isBlocked: item.isBlocked,
            });
            // Allow error to propagate if needed
            throw err;
          }
        },
      });
    },
    [confirmDialog, blockApi, onSuccess, getItemName, t, blockTitle, unblockTitle, blockMessage, unblockMessage, logContext]
  );

  return handleBlockToggle;
};
