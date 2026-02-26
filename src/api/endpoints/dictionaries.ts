import { realDictionariesApi } from '../real';
import type { DictionaryKey, DictionaryItemType, DictionaryFormData } from '../../types';

export const dictionariesApi = {
  list: (dictKey: DictionaryKey): Promise<DictionaryItemType[]> => {
    return realDictionariesApi.list(dictKey);
  },

  getById: (dictKey: DictionaryKey, id: string): Promise<DictionaryItemType> => {
    return realDictionariesApi.getById(dictKey, id);
  },

  create: (dictKey: DictionaryKey, data: DictionaryFormData): Promise<DictionaryItemType> => {
    return realDictionariesApi.create(dictKey, data);
  },

  update: (
    dictKey: DictionaryKey,
    id: string,
    data: DictionaryFormData
  ): Promise<DictionaryItemType> => {
    return realDictionariesApi.update(dictKey, id, data);
  },

  block: (dictKey: DictionaryKey, id: string, isBlocked: boolean): Promise<DictionaryItemType> => {
    return realDictionariesApi.block(dictKey, id, isBlocked);
  },
};
