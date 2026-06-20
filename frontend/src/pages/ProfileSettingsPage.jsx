import { useState } from 'react';
import { IoPersonOutline, IoShieldOutline, IoNotificationsOutline,
         IoColorPaletteOutline, IoLockClosedOutline, IoWarningOutline } from 'react-icons/io5';
import PageLayout from '../components/PageLayout';
import { useAuth } from '../context/AuthContext';
import { profileApi } from '../apis/profileApi';
import '../css/ProfileSettingsPage.css';

const SETTINGS_TABS = [
  { id: 'profile',       label: 'Profile',       icon: <IoPersonOutline /> },
  { id: 'account',       label: 'Account',       icon: <IoShieldOutline /> },
  { id: 'notifications', label: 'Notifications', icon: <IoNotificationsOutline /> },
  { id: 'appearance',    label: 'Appearance',    icon: <IoColorPaletteOutline /> },
  { id: 'privacy',       label: 'Privacy',       icon: <IoLockClosedOutline /> },
];

function SettingsToggle({ enabled, onToggle, label }) {
  return (
    <div
      className={`settings-toggle-switch ${enabled ? 'enabled' : ''}`}
      onClick={onToggle}
      role="switch"
      aria-checked={enabled}
      aria-label={label}
      tabIndex={0}
    >
      <div className="settings-toggle-knob" />
    </div>
  );
}

function ProfileSettingsPage() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    bio: user?.bio || '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [notifSettings, setNotifSettings] = useState({
    emailNotifications: true,
    memoryReminders: false,
    weeklyDigest: true,
  });

  const [privacySettings, setPrivacySettings] = useState({
    privateProfile: false,
    hideFromSearch: false,
  });

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      await profileApi.updateProfile(profileForm);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to save profile:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <PageLayout pageTitle="Profile & Settings">
      <div className="profile-settings-page">
        <div className="profile-settings-layout">
          {/* Left: Tab Nav */}
          <div className="profile-settings-tab-panel">
            <h3 className="profile-settings-tab-title">Settings</h3>
            {SETTINGS_TABS.map((tab) => (
              <div
                key={tab.id}
                className={`profile-settings-tab-item ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
                role="button"
                tabIndex={0}
                aria-pressed={activeTab === tab.id}
              >
                <span className="profile-settings-tab-icon">{tab.icon}</span>
                {tab.label}
              </div>
            ))}
          </div>

          {/* Right: Content */}
          <div className="profile-settings-content-panel">

            {/* ===== PROFILE TAB ===== */}
            {activeTab === 'profile' && (
              <>
                <h3 className="profile-settings-section-title">Profile Information</h3>

                {/* Avatar */}
                <div className="profile-avatar-section">
                  <div className="profile-avatar-wrapper">
                    <img
                      src={user?.profileImage ||
                        'https://ui-avatars.com/api/?name=User&background=c8a882&color=fff&size=80'}
                      alt="Profile avatar"
                      className="profile-avatar-image"
                    />
                    <button className="profile-avatar-change-btn" aria-label="Change profile photo">
                      ✎
                    </button>
                  </div>
                  <div className="profile-avatar-info">
                    <div className="profile-display-name">{user?.name || 'Your Name'}</div>
                    <div className="profile-display-email">{user?.email}</div>
                  </div>
                </div>

                {saveSuccess && (
                  <div style={{
                    background: 'rgba(100,180,140,0.1)', border: '1px solid #64b48c',
                    borderRadius: '10px', padding: '10px 14px', fontSize: '13px',
                    color: '#3a8a5a', marginBottom: '16px',
                  }}>
                    ✓ Profile saved successfully!
                  </div>
                )}

                <form onSubmit={handleSaveProfile}>
                  <div className="profile-form-grid">
                    <div className="profile-form-field">
                      <label className="profile-form-label" htmlFor="profile-name">Full Name</label>
                      <input
                        id="profile-name"
                        type="text"
                        className="profile-form-input"
                        value={profileForm.name}
                        onChange={(e) => setProfileForm((p) => ({ ...p, name: e.target.value }))}
                      />
                    </div>
                    <div className="profile-form-field">
                      <label className="profile-form-label" htmlFor="profile-email">Email</label>
                      <input
                        id="profile-email"
                        type="email"
                        className="profile-form-input"
                        value={profileForm.email}
                        onChange={(e) => setProfileForm((p) => ({ ...p, email: e.target.value }))}
                      />
                    </div>
                    <div className="profile-form-field full-width">
                      <label className="profile-form-label" htmlFor="profile-bio">Bio</label>
                      <input
                        id="profile-bio"
                        type="text"
                        className="profile-form-input"
                        placeholder="A little about yourself..."
                        value={profileForm.bio}
                        onChange={(e) => setProfileForm((p) => ({ ...p, bio: e.target.value }))}
                      />
                    </div>
                  </div>

                  <button type="submit" className="profile-save-changes-btn" disabled={isSaving}>
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </button>
                </form>

                {/* Danger Zone */}
                <div className="profile-danger-zone">
                  <div className="profile-danger-zone-title">
                    <IoWarningOutline style={{ marginRight: '6px' }} />
                    Danger Zone
                  </div>
                  <p style={{ fontSize: '13px', color: '#7a5c44', marginBottom: '12px' }}>
                    Permanently delete your account and all associated data.
                  </p>
                  <button className="profile-delete-account-btn">
                    Delete My Account
                  </button>
                </div>
              </>
            )}

            {/* ===== NOTIFICATIONS TAB ===== */}
            {activeTab === 'notifications' && (
              <>
                <h3 className="profile-settings-section-title">Notification Preferences</h3>
                {[
                  { key: 'emailNotifications', label: 'Email Notifications', desc: 'Receive updates via email' },
                  { key: 'memoryReminders', label: 'Memory Reminders', desc: 'Get notified about memories on this day' },
                  { key: 'weeklyDigest', label: 'Weekly Digest', desc: "A summary of your week's activity" },
                ].map((item) => (
                  <div key={item.key} className="settings-toggle-row">
                    <div>
                      <div className="settings-toggle-label">{item.label}</div>
                      <div className="settings-toggle-desc">{item.desc}</div>
                    </div>
                    <SettingsToggle
                      enabled={notifSettings[item.key]}
                      onToggle={() => setNotifSettings((p) => ({ ...p, [item.key]: !p[item.key] }))}
                      label={item.label}
                    />
                  </div>
                ))}
              </>
            )}

            {/* ===== PRIVACY TAB ===== */}
            {activeTab === 'privacy' && (
              <>
                <h3 className="profile-settings-section-title">Privacy Settings</h3>
                {[
                  { key: 'privateProfile', label: 'Private Profile', desc: 'Only you can see your profile' },
                  { key: 'hideFromSearch', label: 'Hide from Search', desc: "Other users can't find you by name" },
                ].map((item) => (
                  <div key={item.key} className="settings-toggle-row">
                    <div>
                      <div className="settings-toggle-label">{item.label}</div>
                      <div className="settings-toggle-desc">{item.desc}</div>
                    </div>
                    <SettingsToggle
                      enabled={privacySettings[item.key]}
                      onToggle={() => setPrivacySettings((p) => ({ ...p, [item.key]: !p[item.key] }))}
                      label={item.label}
                    />
                  </div>
                ))}
              </>
            )}

            {/* Other tabs placeholder */}
            {(activeTab === 'account' || activeTab === 'appearance') && (
              <div style={{ textAlign: 'center', padding: '60px', color: '#c8a882', fontSize: '15px' }}>
                <div style={{ fontSize: '40px', marginBottom: '12px' }}>🚧</div>
                {activeTab === 'account' ? 'Account settings coming soon...' : 'Theme & appearance coming soon...'}
              </div>
            )}
          </div>
        </div>
      </div>
    </PageLayout>
  );
}

export default ProfileSettingsPage;

