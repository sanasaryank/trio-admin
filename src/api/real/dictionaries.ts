import type { DictionaryKey, DictionaryItemType, DictionaryFormData } from '../../types';
import { realApiFetch } from './client';
import { env } from '../../config/env';

const DICTIONARIES_BASE_URL = `${env.apiBaseUrl}/admin/dictionaries`;

export const realDictionariesApi = {
  list: async (dictKey: DictionaryKey): Promise<DictionaryItemType[]> => {
    const response = await realApiFetch(`${DICTIONARIES_BASE_URL}/${dictKey}`, {
      method: 'GET',
    });

    return response.json();
  },

  getById: async (dictKey: DictionaryKey, id: string): Promise<DictionaryItemType> => {
    const response = await realApiFetch(`${DICTIONARIES_BASE_URL}/${dictKey}/${id}`, {
      method: 'GET',
    });

    return response.json();
  },

  create: async (dictKey: DictionaryKey, data: DictionaryFormData): Promise<DictionaryItemType> => {
    const response = await realApiFetch(`${DICTIONARIES_BASE_URL}/${dictKey}`, {
      method: 'POST',
      body: JSON.stringify(data),
    });

    return response.json();
  },

  update: async (
    dictKey: DictionaryKey,
    id: string,
    data: DictionaryFormData
  ): Promise<DictionaryItemType> => {
    const response = await realApiFetch(`${DICTIONARIES_BASE_URL}/${dictKey}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });

    return response.json();
  },

  block: async (dictKey: DictionaryKey, id: string, isBlocked: boolean): Promise<DictionaryItemType> => {
    const response = await realApiFetch(`${DICTIONARIES_BASE_URL}/${dictKey}/${id}/block`, {
      method: 'PATCH',
      body: JSON.stringify({ isBlocked }),
    });

    return response.json();
  },
};
