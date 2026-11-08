import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Heart, 
  Download, 
  Upload, 
  CheckCircle2, 
  AlertCircle,
  Smartphone,
  Sliders,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AppSettings, ReminderFrequency } from '../types';
import { 
  checkNotificationPermission, 
  requestNotificationPermission, 
  syncScheduledReminders, 
  sendTestNotification,
  formatFrequencyLabel
} from '../utils/notifications';

const SETTINGS_STORAGE_KEY = 'the_three_things_settings';

const FREQUENCY_STEPS: ReminderFrequency[] = ['15m', '30m', '45m', '1h', 'custom'];

const FREQUENCY_STEP_LABELS: Record<ReminderFrequency, string> = {
  '15m': '15 mins',
  '30m': '30 mins',
  '45m': '45 mins',
  '1h': '1 hr',
  'custom': 'Custom',
};

export const DEFAULT_SETTINGS: AppSettings = {
  notifications: {
    enabled: false,
    frequency: '30m',
    customMinutes: 20,
  },
};

export const getStoredSettings = (): AppSettings => {
  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      const notifications = parsed.notifications || {};
      
      // Handle legacy migration if needed
      const frequency = FREQUENCY_STEPS.includes(notifications.frequency) 
        ? notifications.frequency 
        : '30m';

      return {
        notifications: {
          enabled: Boolean(notifications.enabled ?? notifications.morningEnabled ?? false),
          frequency,
          customMinutes: typeof notifications.customMinutes === 'number' ? notifications.customMinutes : 20,
        },
      };
    }
  } catch (e) {
    console.error('Failed to read settings from localStorage', e);
  }
  return DEFAULT_SETTINGS;
};

export const saveStoredSettings = (settings: AppSettings) => {
  try {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save settings to localStorage', e);
  }
};

export const SettingsView: React.FC = () => {
  const [settings, setSettings] = useState<AppSettings>(getStoredSettings);
  const [permissionStatus, setPermissionStatus] = useState<'granted' | 'denied' | 'prompt'>('prompt');
  const [testNotificationState, setTestNotificationState] = useState<'idle' | 'testing' | 'sent' | 'error'>('idle');
  const [importExportNotice, setImportExportNotice] = useState<string | null>(null);

  // Check permission on mount
  useEffect(() => {
    checkNotificationPermission().then((status) => {
      setPermissionStatus(status);
    });
  }, []);

  const updateSettings = (updater: (prev: AppSettings) => AppSettings) => {
    setSettings((prev) => {
      const next = updater(prev);
      saveStoredSettings(next);
      syncScheduledReminders(next.notifications);
      return next;
    });
  };

  const handleToggleNotifications = async () => {
    const nextEnabled = !settings.notifications.enabled;
    if (nextEnabled && permissionStatus !== 'granted') {
      const granted = await requestNotificationPermission();
      setPermissionStatus(granted ? 'granted' : 'denied');
      if (!granted) return;
    }
    updateSettings((prev) => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        enabled: nextEnabled,
      },
    }));
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const index = parseInt(e.target.value, 10);
    const selectedFreq = FREQUENCY_STEPS[index] || '30m';
    updateSettings((prev) => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        frequency: selectedFreq,
      },
    }));
  };

  const handleSelectFrequency = (freq: ReminderFrequency) => {
    updateSettings((prev) => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        frequency: freq,
      },
    }));
  };

  const handleCustomMinutesChange = (val: number) => {
    const clamped = Math.max(5, Math.min(360, val));
    updateSettings((prev) => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        customMinutes: clamped,
      },
    }));
  };

  const handleRequestPermission = async () => {
    const granted = await requestNotificationPermission();
    setPermissionStatus(granted ? 'granted' : 'denied');
    if (granted) {
      syncScheduledReminders(settings.notifications);
    }
  };

  const handleSendTest = async () => {
    setTestNotificationState('testing');
    const success = await sendTestNotification();
    if (success) {
      setTestNotificationState('sent');
      setTimeout(() => setTestNotificationState('idle'), 4000);
    } else {
      setTestNotificationState('error');
      setTimeout(() => setTestNotificationState('idle'), 4000);
    }
  };

  // Export JSON backup
  const handleExportData = () => {
    try {
      const backup: Record<string, unknown> = {
        exportedAt: new Date().toISOString(),
        version: '0.1.0',
        appState: localStorage.getItem('the_three_things_app_state_v3'),
        painPoints: localStorage.getItem('the_three_things_pain_points_v1'),
        mediaCards: localStorage.getItem('the_three_things_media_cards_v1'),
        settings: localStorage.getItem(SETTINGS_STORAGE_KEY),
      };

      const dataBlob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `the-three-things-backup-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      setImportExportNotice('Backup file downloaded successfully.');
      setTimeout(() => setImportExportNotice(null), 4000);
    } catch (e) {
      console.error('Export failed:', e);
      setImportExportNotice('Export failed.');
      setTimeout(() => setImportExportNotice(null), 4000);
    }
  };

  // Import JSON backup
  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);

        if (parsed.appState) localStorage.setItem('the_three_things_app_state_v3', parsed.appState);
        if (parsed.painPoints) localStorage.setItem('the_three_things_pain_points_v1', parsed.painPoints);
        if (parsed.mediaCards) localStorage.setItem('the_three_things_media_cards_v1', parsed.mediaCards);
        if (parsed.settings) localStorage.setItem(SETTINGS_STORAGE_KEY, parsed.settings);

        setImportExportNotice('Backup imported! Reloading data...');
        setTimeout(() => {
          window.location.reload();
        }, 1200);
      } catch (err) {
        console.error('Import parse error:', err);
        setImportExportNotice('Failed to import backup: invalid JSON file.');
        setTimeout(() => setImportExportNotice(null), 4000);
      }
    };
    reader.readAsText(file);
  };

  const currentStepIndex = Math.max(0, FREQUENCY_STEPS.indexOf(settings.notifications.frequency));

  return (
    <main className="flex-1 min-h-0 px-4 md:px-8 py-8 max-w-4xl w-full mx-auto overflow-y-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-serif-accent italic text-[#2D2A26] mb-1.5">
          Settings & Preferences
        </h1>
        <p className="text-sm text-[#78716A]">
          Configure quiet focus notifications, backup your workspace, and support the project.
        </p>
      </div>

      <div className="space-y-6 pb-12">
        {/* Section 1: Minimalist Notification Settings */}
        <section className="bg-[#F5F0E8] border border-[#E6DFD5] rounded-3xl p-5 md:p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#FAF7F2] border border-[#E6DFD5] flex items-center justify-center text-[#DA7756]">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-[#2D2A26]">Focus Reminders</h2>
                <p className="text-xs text-[#78716A]">Gentle periodic nudges to stay connected to your 3 priorities</p>
              </div>
            </div>

            {/* Master Toggle */}
            <button
              type="button"
              onClick={handleToggleNotifications}
              className={`w-12 h-6.5 rounded-full transition-colors cursor-pointer relative p-0.5 ${
                settings.notifications.enabled ? 'bg-[#DA7756]' : 'bg-[#E6DFD5]'
              }`}
              aria-label="Toggle notifications"
            >
              <div className={`w-5.5 h-5.5 rounded-full bg-white shadow-xs transition-transform ${
                settings.notifications.enabled ? 'translate-x-5.5' : 'translate-x-0'
              }`} />
            </button>
          </div>

          {/* Permission Status Banner if not granted */}
          {permissionStatus !== 'granted' && (
            <div className="mb-5 p-3.5 rounded-2xl bg-[#FDF3EF] border border-[#DA7756]/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-start gap-2.5 text-[#2D2A26]">
                <AlertCircle className="w-4 h-4 text-[#DA7756] shrink-0 mt-0.5 sm:mt-0" />
                <span>
                  <strong>Notification permissions required.</strong> Allow notifications so reminders can appear on your lock screen and status bar.
                </span>
              </div>
              <button
                onClick={handleRequestPermission}
                className="px-3 py-1.5 rounded-xl bg-[#DA7756] hover:bg-[#C86446] text-white font-medium text-xs whitespace-nowrap cursor-pointer transition-colors shadow-2xs"
              >
                Allow Notifications
              </button>
            </div>
          )}

          {/* Minimalist Slider Container */}
          <div className={`transition-all duration-300 ${
            settings.notifications.enabled ? 'opacity-100' : 'opacity-40 pointer-events-none'
          }`}>
            <div className="p-5 rounded-2xl bg-[#FAF7F2]/80 border border-[#E6DFD5] space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-[#DA7756]" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#78716A]">
                    Reminder Cadence
                  </span>
                </div>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-[#DA7756]/10 text-[#DA7756] text-xs font-semibold">
                  {formatFrequencyLabel(settings.notifications)}
                </span>
              </div>

              {/* Slider Track */}
              <div className="pt-2 pb-1">
                <div className="relative flex items-center">
                  <input
                    type="range"
                    min={0}
                    max={4}
                    step={1}
                    value={currentStepIndex}
                    onChange={handleSliderChange}
                    className="w-full h-2 bg-[#E6DFD5] rounded-lg appearance-none cursor-pointer accent-[#DA7756] focus:outline-none"
                  />
                </div>

                {/* Stepped labels */}
                <div className="flex justify-between items-center mt-3 text-xs">
                  {FREQUENCY_STEPS.map((step, idx) => {
                    const isSelected = settings.notifications.frequency === step;
                    return (
                      <button
                        key={step}
                        type="button"
                        onClick={() => handleSelectFrequency(step)}
                        className={`transition-all cursor-pointer font-medium px-2 py-1 rounded-lg ${
                          isSelected
                            ? 'bg-[#DA7756] text-white shadow-2xs'
                            : 'text-[#78716A] hover:text-[#2D2A26] hover:bg-white/60'
                        }`}
                      >
                        {FREQUENCY_STEP_LABELS[step]}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Custom Interval Option Input */}
              <AnimatePresence>
                {settings.notifications.frequency === 'custom' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="pt-3 border-t border-[#E6DFD5]/80 flex flex-wrap items-center justify-between gap-3"
                  >
                    <div className="text-xs text-[#78716A]">
                      Set custom interval (in minutes):
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min={5}
                        max={360}
                        step={5}
                        value={settings.notifications.customMinutes || 20}
                        onChange={(e) => handleCustomMinutesChange(parseInt(e.target.value, 10) || 20)}
                        className="w-20 px-3 py-1.5 rounded-xl bg-white border border-[#E6DFD5] text-xs font-semibold text-[#2D2A26] text-center focus:outline-none focus:border-[#DA7756]"
                      />
                      <span className="text-xs text-[#78716A] font-medium">minutes</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Test Notification Trigger */}
            <div className="mt-4 flex items-center justify-between">
              <span className="text-xs text-[#78716A]">
                Want to preview how nudges appear on your screen?
              </span>
              <button
                type="button"
                onClick={handleSendTest}
                disabled={testNotificationState === 'testing'}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#FAF7F2] hover:bg-white border border-[#E6DFD5] text-[#2D2A26] transition-all cursor-pointer shadow-2xs hover:shadow-xs disabled:opacity-50"
              >
                <Smartphone className="w-3.5 h-3.5 text-[#DA7756]" />
                <span>
                  {testNotificationState === 'testing'
                    ? 'Scheduling...'
                    : testNotificationState === 'sent'
                    ? 'Sent! Check banner'
                    : testNotificationState === 'error'
                    ? 'Permission Needed'
                    : 'Test Notification'}
                </span>
              </button>
            </div>
          </div>
        </section>

        {/* Section 2: Data Backup & Restore */}
        <section className="bg-[#F5F0E8] border border-[#E6DFD5] rounded-3xl p-5 md:p-6 shadow-xs">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-2xl bg-[#FAF7F2] border border-[#E6DFD5] flex items-center justify-center text-[#DA7756]">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-[#2D2A26]">Data & Backup</h2>
              <p className="text-xs text-[#78716A]">Your data stays strictly local on your device. Export backups anytime.</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleExportData}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white hover:bg-[#FAF7F2] border border-[#E6DFD5] text-xs font-semibold text-[#2D2A26] transition-all cursor-pointer shadow-2xs hover:shadow-xs"
            >
              <Download className="w-3.5 h-3.5 text-[#DA7756]" />
              <span>Export Local Backup (JSON)</span>
            </button>

            <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white hover:bg-[#FAF7F2] border border-[#E6DFD5] text-xs font-semibold text-[#2D2A26] transition-all cursor-pointer shadow-2xs hover:shadow-xs">
              <Upload className="w-3.5 h-3.5 text-[#DA7756]" />
              <span>Import Backup</span>
              <input
                type="file"
                accept=".json"
                onChange={handleImportData}
                className="hidden"
              />
            </label>
          </div>

          <AnimatePresence>
            {importExportNotice && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mt-3 text-xs font-medium text-[#6E8B74] flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{importExportNotice}</span>
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* Section 3: Support & Project Info */}
        <section className="bg-[#F5F0E8] border border-[#E6DFD5] rounded-3xl p-5 md:p-6 shadow-xs text-center md:text-left">
          <div className="flex flex-col md:flex-row items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-[#FAF7F2] border border-[#E6DFD5] flex items-center justify-center text-[#DA7756] shrink-0 shadow-2xs">
              <Heart className="w-7 h-7 fill-[#DA7756]/20 text-[#DA7756]" />
            </div>
            <div className="flex-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#E6DFD5]/60 text-xs font-semibold text-[#78716A] mb-1.5">
                <span>The Three Things · v0.1.0</span>
              </div>
              <h3 className="text-xl font-serif-accent italic text-[#2D2A26] mb-1">
                Support The Project
              </h3>
              <p className="text-xs text-[#78716A] leading-relaxed max-w-xl">
                Thank you for using The Three Things. This app is crafted as a quiet, tactile haven for intentional daily living. 
                Feedback channels, roadmap updates, and creator appreciation will continue to be hosted here.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
};
