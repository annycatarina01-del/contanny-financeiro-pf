import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AppOption } from '../modules/cadastros/cadastros.types';
import { CadastrosService } from '../modules/cadastros/cadastros.service';

interface OptionsContextData {
  options: AppOption[];
  loading: boolean;
  refreshOptions: () => Promise<void>;
  getOptionsByType: (type: AppOption['type']) => AppOption[];
}

const OptionsContext = createContext<OptionsContextData>({} as OptionsContextData);

export function OptionsProvider({ children }: { children: ReactNode }) {
  const [options, setOptions] = useState<AppOption[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshOptions = async () => {
    try {
      setLoading(true);
      const data = await CadastrosService.getAll();
      setOptions(data);
    } catch (error) {
      console.error("Failed to fetch options", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshOptions();
  }, []);

  const getOptionsByType = (type: AppOption['type']) => {
    return options.filter(opt => opt.type === type);
  };

  return (
    <OptionsContext.Provider value={{ options, loading, refreshOptions, getOptionsByType }}>
      {children}
    </OptionsContext.Provider>
  );
}

export function useOptions() {
  const context = useContext(OptionsContext);
  if (!context) {
    throw new Error('useOptions must be used within an OptionsProvider');
  }
  return context;
}
