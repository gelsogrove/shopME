/**
 * Mock data for settings in integration tests
 */

export const mockWorkspaceSettings = {
  language: 'ENG',
  currency: 'EUR',
  dateFormat: 'DD/MM/YYYY',
  timeFormat: '24h',
  timezone: 'Europe/Rome',
  theme: 'light',
  logo: null,
  favicon: null,
  primaryColor: '#336699',
  secondaryColor: '#669933'
};

export const mockWorkspaceSettingsUpdate = {
  language: 'ITA',
  currency: 'USD',
  dateFormat: 'MM/DD/YYYY',
  timeFormat: '12h',
  timezone: 'Europe/London',
  theme: 'dark',
  primaryColor: '#993366',
  secondaryColor: '#339966'
};

export const mockUserSettings = {
  language: 'ENG',
  theme: 'light',
  notifications: true,
  emailNotifications: true,
  pushNotifications: false
};

export const mockUserSettingsUpdate = {
  language: 'ITA',
  theme: 'dark',
  notifications: true,
  emailNotifications: false,
  pushNotifications: true
}; 