import { mockDictionariesApi } from '../mock';
import type { DictionaryKey, DictionaryItemType, DictionaryFormData } from '../../types';

export const dictionariesApi = {
  list: (dictKey: DictionaryKey): Promise<DictionaryItemType[]> => {
    return mockDictionariesApi.list(dictKey);
  },

  getById: (dictKey: DictionaryKey, id: number): Promise<DictionaryItemType> => {
    return mockDictionariesApi.getById(dictKey, id);
  },

  create: (dictKey: DictionaryKey, data: DictionaryFormData): Promise<DictionaryItemType> => {
    return mockDictionariesApi.create(dictKey, data);
  },

  update: (
    dictKey: DictionaryKey,
    id: number,
    data: DictionaryFormData
  ): Promise<DictionaryItemType> => {
    return mockDictionariesApi.update(dictKey, id, data);
  },

  block: (dictKey: DictionaryKey, id: number, blocked: boolean): Promise<DictionaryItemType> => {
    return mockDictionariesApi.block(dictKey, id, blocked);
  },
};
