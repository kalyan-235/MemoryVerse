import { useState, useRef } from 'react';
import {
  IoPersonOutline, IoShieldOutline, IoNotificationsOutline,
  IoColorPaletteOutline, IoLockClosedOutline, IoWarningOutline,
  IoCameraOutline, IoEyeOutline, IoEyeOffOutline, IoCheckmarkCircle,
} from 'react-icons/io5';
import PageLayout from '../components/PageLayout';
import { useAuth } from '../context/AuthContext';
import { profileApi } from '../apis/profileApi';
import { uploadFileToCloudinary } from '../apis/cloudinaryApi';
import toast from 'react-hot-toast';
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
      aria-label={`Toggle ${label}`}
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && onToggle()}
    >
      <div className="settings-toggle-knob" />
    </div>
  );
}

function ProfileSettingsPage() {
  const { user, updateUser, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const avatarInputRef = useRef(null);

  // Profile form
  const [profileForm, setProfileForm] = useState({
    name:  user?.name  || '',
    email: user?.email || '',
    bio:   user?.bio   || '',
  });
  const [avatarPreview, setAvatarPreview] = useState(user?.profileImage || '');
  const [avatarFile,    setAvatarFile]    = useState(null);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Password form
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '', newPassword: '', confirmPassword: '',
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false, new: false, confirm: false,
  });
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  // Notifications
  const [notifSettings, setNotifSettings] = useState({
    emailNotifications: true,
    memoryReminders:    false,
    weeklyDigest:       true,
  });

  // Privacy
  const [privacySettings, setPrivacySettings] = useState({
    privateProfile: false,
    hideFromSearch: false,
  });

  // Appearance
  const [theme, setTheme] = useState('light');

  // ── Avatar select ──
  const handleAvatarSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  // ── Save profile ──
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setIsSavingProfile(true);
    try {
      let photoUrl = avatarPreview;

      // Upload new avatar to Cloudinary if changed
      if (avatarFile) {
        toast.loading('Uploading photo...', { id: 'avatar' });
        try {
          const result = await uploadFileToCloudinary(avatarFile, 'memoryverse/profiles');
          photoUrl = result.secure_url;
          toast.dismiss('avatar');
        } catch (err) {
          toast.dismiss('avatar');
          console.warn('Avatar upload failed:', err.message);
        }
      }

      const updated = await profileApi.updateProfile({
        name:         profileForm.name,
        bio:          profileForm.bio,
        profileImage: photoUrl,
      });

      updateUser?.(updated);
      setAvatarFile(null);
      toast.success('Profile saved! ✨');
    } catch (err) {
      toast.error(err.message || 'Failed to save profile.');
    } finally {
      setIsSavingProfile(false);
    }
  };

  // ── Change password ──
  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('New passwords do not match.');
      return;
    }
    if (passwordForm.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters.');
      return;
    }
    setIsSavingPassword(true);
    try {
      await profileApi.changePassword(
        passwordForm.currentPassword,
        passwordForm.newPassword,
      );
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      toast.success('Password changed successfully!');
    } catch (err) {
      toast.error(err.message || 'Failed to change password.');
    } finally {
      setIsSavingPassword(false);
    }
  };

  const avatarSrc = avatarPreview ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=c8a882&color=fff&size=80`;

  return (
    <PageLayout pageTitle="Profile & Settings">
      <div className="profile-settings-page">
        <div className="profile-settings-layout">

          {/* ── Left Tab Nav ── */}
          <div className="profile-settings-tab-panel">
            <h3 className="profile-settings-tab-title">Settings</h3>
            {SETTINGS_TABS.map(tab => (
              <div
                key={tab.id}
                className={`profile-settings-tab-item ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
                role="button" tabIndex={0}
                onKeyDown={e => e.key === 'Enter' && setActiveTab(tab.id)}
              >
                <span className="profile-settings-tab-icon">{tab.icon}</span>
                {tab.label}
              </div>
            ))}
          </div>

          {/* ── Right Content ── */}
          <div className="profile-settings-content-panel">

            {/* ═══ PROFILE TAB ═══ */}
            {activeTab === 'profile' && (
              <>
                <h3 className="profile-settings-section-title">Profile Information</h3>

                {/* Avatar */}
                <div className="profile-avatar-section">
                  <div className="profile-avatar-wrapper">
                    <img src={avatarSrc} alt="Profile" className="profile-avatar-image" />
                    <button
                      type="button"
                      className="profile-avatar-change-btn"
                      onClick={() => avatarInputRef.current?.click()}
                      aria-label="Change profile photo"
                    >
                      <IoCameraOutline size={13} />
                    </button>
                    <input
                      ref={avatarInputRef}
                      type="file"
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={handleAvatarSelect}
                    />
                  </div>
                  <div className="profile-avatar-info">
                    <div className="profile-display-name">{user?.name || 'Your Name'}</div>
                    <div className="profile-display-email">{user?.email}</div>
                    {avatarFile && (
                      <div style={{ fontSize: '12px', color: '#9b8ec4', marginTop: '4px' }}>
                        New photo selected — save to apply
                      </div>
                    )}
                  </div>
                </div>

                <form onSubmit={handleSaveProfile}>
                  <div className="profile-form-grid">
                    <div className="profile-form-field">
                      <label className="profile-form-label" htmlFor="p-name">Full Name</label>
                      <input id="p-name" type="text" className="profile-form-input"
                        value={profileForm.name}
                        onChange={e => setProfileForm(p => ({ ...p, name: e.target.value }))} />
                    </div>
                    <div className="profile-form-field">
                      <label className="profile-form-label" htmlFor="p-email">Email</label>
                      <input id="p-email" type="email" className="profile-form-input"
                        value={profileForm.email}
                        disabled
                        style={{ opacity: 0.6, cursor: 'not-allowed' }}
                        title="Email cannot be changed" />
                    </div>
                    <div className="profile-form-field full-width">
                      <label className="profile-form-label" htmlFor="p-bio">Bio</label>
                      <input id="p-bio" type="text" className="profile-form-input"
                        placeholder="A little about yourself..."
                        value={profileForm.bio}
                        onChange={e => setProfileForm(p => ({ ...p, bio: e.target.value }))} />
                    </div>
                  </div>

                  <button type="submit" className="profile-save-changes-btn" disabled={isSavingProfile}>
                    {isSavingProfile ? 'Saving...' : 'Save Changes'}
                  </button>
                </form>

                {/* Danger Zone */}
                <div className="profile-danger-zone" style={{ marginTop: '32px' }}>
                  <div className="profile-danger-zone-title">
                    <IoWarningOutline /> Danger Zone
                  </div>
                  <p style={{ fontSize: '13px', color: '#7a5c44', marginBottom: '12px' }}>
                    Permanently delete your account and all associated data. This cannot be undone.
                  </p>
                  <button
                    className="profile-delete-account-btn"
                    onClick={() => {
                      if (window.confirm('Are you sure? This will permanently delete your account and ALL your memories, diaries, and stories.')) {
                        logout();
                      }
                    }}
                  >
                    Delete My Account
                  </button>
                </div>
              </>
            )}

            {/* ═══ ACCOUNT TAB ═══ */}
            {activeTab === 'account' && (
              <>
                <h3 className="profile-settings-section-title">Change Password</h3>

                <form onSubmit={handleChangePassword}>
                  {[
                    { id: 'curr-pass', key: 'currentPassword', label: 'Current Password', show: 'current' },
                    { id: 'new-pass',  key: 'newPassword',     label: 'New Password',     show: 'new'     },
                    { id: 'conf-pass', key: 'confirmPassword', label: 'Confirm New Password', show: 'confirm' },
                  ].map(field => (
                    <div key={field.id} className="profile-form-field" style={{ marginBottom: '16px' }}>
                      <label className="profile-form-label" htmlFor={field.id}>{field.label}</label>
                      <div style={{ position: 'relative' }}>
                        <input
                          id={field.id}
                          type={showPasswords[field.show] ? 'text' : 'password'}
                          className="profile-form-input"
                          placeholder="••••••••"
                          value={passwordForm[field.key]}
                          onChange={e => setPasswordForm(p => ({ ...p, [field.key]: e.target.value }))}
                          style={{ paddingRight: '44px' }}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPasswords(p => ({ ...p, [field.show]: !p[field.show] }))}
                          style={{
                            position: 'absolute', right: '12px', top: '50%',
                            transform: 'translateY(-50%)', background: 'none',
                            border: 'none', cursor: 'pointer', color: '#c8a882', fontSize: '16px',
                          }}
                          aria-label={showPasswords[field.show] ? 'Hide' : 'Show'}
                        >
                          {showPasswords[field.show] ? <IoEyeOffOutline /> : <IoEyeOutline />}
                        </button>
                      </div>
                    </div>
                  ))}

                  <button type="submit" className="profile-save-changes-btn" disabled={isSavingPassword}>
                    {isSavingPassword ? 'Changing...' : 'Change Password'}
                  </button>
                </form>

                {/* Account stats */}
                <div style={{
                  marginTop: '32px', background: '#fdf6ec', borderRadius: '14px',
                  padding: '20px', border: '1px solid #e8d5c0',
                }}>
                  <h4 style={{ fontFamily: 'Georgia,serif', fontSize: '15px', color: '#3d2c1e', marginBottom: '14px' }}>
                    Account Details
                  </h4>
                  {[
                    { label: 'Account Email', value: user?.email },
                    { label: 'Member Since', value: user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' }) : 'N/A' },
                    { label: 'Email Verified', value: user?.isEmailVerified ? '✅ Verified' : '❌ Not verified' },
                  ].map(item => (
                    <div key={item.label} style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      padding: '10px 0', borderBottom: '1px solid #f0e4d4',
                    }}>
                      <span style={{ fontSize: '13px', color: '#7a5c44' }}>{item.label}</span>
                      <span style={{ fontSize: '13px', fontWeight: '600', color: '#3d2c1e' }}>{item.value}</span>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* ═══ NOTIFICATIONS TAB ═══ */}
            {activeTab === 'notifications' && (
              <>
                <h3 className="profile-settings-section-title">Notification Preferences</h3>
                {[
                  { key: 'emailNotifications', label: 'Email Notifications', desc: 'Receive updates and alerts via email' },
                  { key: 'memoryReminders', label: 'Memory Reminders', desc: 'Get notified about memories made on this day in previous years' },
                  { key: 'weeklyDigest', label: 'Weekly Digest', desc: "A summary of your week's memories and activity" },
                ].map(item => (
                  <div key={item.key} className="settings-toggle-row">
                    <div>
                      <div className="settings-toggle-label">{item.label}</div>
                      <div className="settings-toggle-desc">{item.desc}</div>
                    </div>
                    <SettingsToggle
                      enabled={notifSettings[item.key]}
                      onToggle={() => setNotifSettings(p => ({ ...p, [item.key]: !p[item.key] }))}
                      label={item.label}
                    />
                  </div>
                ))}
              </>
            )}

            {/* ═══ APPEARANCE TAB ═══ */}
            {activeTab === 'appearance' && (
              <>
                <h3 className="profile-settings-section-title">Appearance</h3>
                <p style={{ fontSize: '14px', color: '#9b8ec4', marginBottom: '24px' }}>
                  Choose how MemoryVerse looks to you.
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  {[
                    { id: 'light', label: '☀️ Light', desc: 'Warm cream & beige tones', bg: '#fdf6ec', border: '#c8a882' },
                    { id: 'dark',  label: '🌙 Dark',  desc: 'Coming soon', bg: '#1a1a2e', border: '#9b8ec4', disabled: true },
                  ].map(opt => (
                    <div
                      key={opt.id}
                      onClick={() => !opt.disabled && setTheme(opt.id)}
                      style={{
                        border: `2px solid ${theme === opt.id ? '#9b8ec4' : '#e8d5c0'}`,
                        borderRadius: '14px', padding: '20px', cursor: opt.disabled ? 'not-allowed' : 'pointer',
                        background: '#fff', transition: 'all 0.2s', opacity: opt.disabled ? 0.5 : 1,
                        position: 'relative',
                      }}
                    >
                      <div style={{
                        width: '100%', height: '60px', borderRadius: '8px',
                        background: opt.bg, border: `1px solid ${opt.border}`,
                        marginBottom: '12px',
                      }} />
                      <div style={{ fontWeight: '700', color: '#3d2c1e', fontSize: '14px' }}>{opt.label}</div>
                      <div style={{ fontSize: '12px', color: '#9b8ec4', marginTop: '4px' }}>{opt.desc}</div>
                      {theme === opt.id && (
                        <div style={{ position: 'absolute', top: '10px', right: '10px', color: '#9b8ec4', fontSize: '18px' }}>
                          <IoCheckmarkCircle />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* ═══ PRIVACY TAB ═══ */}
            {activeTab === 'privacy' && (
              <>
                <h3 className="profile-settings-section-title">Privacy Settings</h3>
                {[
                  { key: 'privateProfile', label: 'Private Profile', desc: 'Only you can see your profile and memories' },
                  { key: 'hideFromSearch', label: 'Hide from Search', desc: "Other users can't find you by name or email" },
                ].map(item => (
                  <div key={item.key} className="settings-toggle-row">
                    <div>
                      <div className="settings-toggle-label">{item.label}</div>
                      <div className="settings-toggle-desc">{item.desc}</div>
                    </div>
                    <SettingsToggle
                      enabled={privacySettings[item.key]}
                      onToggle={() => setPrivacySettings(p => ({ ...p, [item.key]: !p[item.key] }))}
                      label={item.label}
                    />
                  </div>
                ))}

                <div style={{
                  marginTop: '24px', background: 'rgba(155,142,196,0.08)',
                  borderRadius: '12px', padding: '16px', border: '1px solid rgba(155,142,196,0.2)',
                }}>
                  <p style={{ fontSize: '13px', color: '#7a5c44', lineHeight: '1.6' }}>
                    🔒 Your diary entries and personal memories are always private by default.
                    Only you can see them regardless of these settings.
                  </p>
                </div>
              </>
            )}

          </div>
        </div>
      </div>
    </PageLayout>
  );
}

export default ProfileSettingsPage;
