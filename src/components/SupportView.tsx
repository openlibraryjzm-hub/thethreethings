import React from 'react';
import { SettingsView } from './SettingsView';

/**
 * SupportView has been refactored into SettingsView (which includes the Support section).
 * Maintained for backward compatibility.
 */
export const SupportView: React.FC = () => {
  return <SettingsView />;
};
