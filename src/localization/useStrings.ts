import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import strings from '@/localization/strings';

export const useStrings = () => {
  const lang = useSelector((state: RootState) => state.auth.lang);

  // Synchronously set language and return updated strings
  const localizedStrings = useMemo(() => {
    strings.setLanguage(lang);
    return strings;
  }, [lang]);

  return localizedStrings;
};