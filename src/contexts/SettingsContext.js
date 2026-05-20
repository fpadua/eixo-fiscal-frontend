'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { nfseApi } from '@/lib/api';

const STORAGE_KEY = 'app-nfs-settings';

const defaultSettings = {
  nfseVersion: process.env.NEXT_PUBLIC_NFSE_VERSION || 'v2',
  ambiente: 'homologacao', // padrão
};

const versions = {
  v1: { label: 'ABRASF 2.0', description: 'Goiânia/GO', full: 'Padrão ABRASF 2.0 (Goiânia/GO)' },
  v2: { label: 'NFS-e Nacional', description: 'Padrão Nacional', full: 'Padrão NFS-e Nacional (SPED/RFB)' },
};

const SettingsContext = createContext(null);

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(defaultSettings);
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);

  useEffect(() => {
    const load = async () => {
      let localSettings = null;
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) localSettings = JSON.parse(stored);
      } catch {}

      try {
        const resp = await nfseApi.config.obterNfseUi();
        const serverData = resp?.data || {};
        const merged = {
          ...defaultSettings,
          ...localSettings,
          nfseVersion: serverData.nfseVersion || defaultSettings.nfseVersion,
          ambiente: serverData.ambiente || defaultSettings.ambiente,
        };
        setSettings(merged);
      } catch {
        if (localSettings) setSettings({ ...defaultSettings, ...localSettings });
      } finally {
        setLoaded(true);
      }
    };

    load();
  }, []);

  useEffect(() => {
    if (loaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    }
  }, [settings, loaded]);

  const updateSettings = async (updates) => {
    const next = { ...settings, ...updates };
    setSettings(next);
    setSaveError(null);

    const hasVersion = updates.nfseVersion !== undefined;
    const hasAmbiente = updates.ambiente !== undefined;

    if (hasVersion || hasAmbiente) {
      setSaving(true);
      try {
        await nfseApi.config.salvarNfseUi({
          nfseVersion: hasVersion ? updates.nfseVersion : undefined,
          ambiente: hasAmbiente ? updates.ambiente : undefined,
        });
      } catch (error) {
        setSaveError(error?.response?.data?.erro || error.message || 'Erro ao salvar configuração');
      } finally {
        setSaving(false);
      }
    }
  };

  const currentVersion = versions[settings.nfseVersion] || versions.v1;

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, currentVersion, versions, loaded, saving, saveError }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider');
  return ctx;
}
