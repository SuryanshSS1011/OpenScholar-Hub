import { useState, useEffect } from 'react';
import Head from 'next/head';
import { withAuth } from '@/middleware/authMiddleware';
import Layout from '@/components/page-templates/Layout';
import { useAuth } from '@/context/AuthContext';
import { User, Settings, Bell, Shield, Key, Mail, Eye, EyeOff, Save, Loader } from 'lucide-react';

const SettingsPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [success, setSuccess] = useState(null);
  
  // Profile settings
  const [profileSettings, setProfileSettings] = useState({
    displayName: user?.displayName || '',
    institution: 'Example University',
    role: 'PhD Candidate',
    location: 'San Francisco, CA',
    website: 'https://example.com',
    bio: 'Researcher focused on artificial intelligence and machine learning applications.'
  });
  
  // Notification settings
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    chatNotifications: true,
    projectUpdates: true,
    researchAlerts: true,
    citationAlerts: true,
    weeklyDigest: true
  });
  
  // Privacy settings
  const [privacySettings, setPrivacySettings] = useState({
    showProfile: true,
    showEmail: false,
    allowDirectMessages: true,
    publicSearchable: true
  });
  
  // Security settings
  const [securitySettings, setSecuritySettings] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileSettings(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleNotificationChange = (e) => {
    const { name, checked } = e.target;
    setNotificationSettings(prev => ({
      ...prev,
      [name]: checked
    }));
  };
  
  const handlePrivacyChange = (e) => {
    const { name, checked } = e.target;
    setPrivacySettings(prev => ({
      ...prev,
      [name]: checked
    }));
  };
  
  const handleSecurityChange = (e) => {
    const { name, value } = e.target;
    setSecuritySettings(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSave = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate saving
    setTimeout(() => {
      console.log('Settings saved:', {
        profile: profileSettings,
        notifications: notificationSettings,
        privacy: privacySettings,
        security: securitySettings
      });
      
      setSuccess('Your settings have been saved successfully.');
      setIsSubmitting(false);
      
      // Clear security form if it was the active tab
      if (activeTab === 'security') {
        setSecuritySettings({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      }
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    }, 1000);
  };
  
  return (
    <Layout>
      <Head>
        <title>Settings - OpenScholar Hub</title>
        <meta name="description" content="Manage your OpenScholar Hub account settings and preferences" />
      </Head>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Settings</h1>
        
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('profile')}
                className={`${
                  activeTab === 'profile'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm flex items-center`}
              >
                <User className="h-5 w-5 mr-2" />
                Profile
              </button>
              <button
                onClick={() => setActiveTab('notifications')}
                className={`${
                  activeTab === 'notifications'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm flex items-center`}
              >
                <Bell className="h-5 w-5 mr-2" />
                Notifications
              </button>
              <button
                onClick={() => setActiveTab('privacy')}
                className={`${
                  activeTab === 'privacy'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm flex items-center`}
              >
                <Shield className="h-5 w-5 mr-2" />
                Privacy
              </button>
              <button
                onClick={() => setActiveTab('security')}
                className={`${
                  activeTab === 'security'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm flex items-center`}
              >
                <Key className="h-5 w-5 mr-2" />
                Security
              </button>
            </nav>
          </div>
          
          {/* Success Message */}
          {success && (
            <div className="bg-green-50 p-4 border-l-4 border-green-400">
              <div className="flex">
                <div className="flex-shrink-0">
                  <Save className="h-5 w-5 text-green-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-green-700">{success}</p>
                </div>
              </div>
            </div>
          )}
          
          {/* Tab Content */}
          <div className="p-6">
            {/* Profile Settings */}
            {activeTab === 'profile' && (
              <form onSubmit={handleSave}>
                <div className="space-y-6">
                  <div>
                    <label htmlFor="displayName" className="block text-sm font-medium text-gray-700">
                      Display Name
                    </label>
                    <input
                      type="text"
                      id="displayName"
                      name="displayName"
                      value={profileSettings.displayName}
                      onChange={handleProfileChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="institution" className="block text-sm font-medium text-gray-700">
                      Institution
                    </label>
                    <input
                      type="text"
                      id="institution"
                      name="institution"
                      value={profileSettings.institution}
                      onChange={handleProfileChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                      Role/Position
                    </label>
                    <input
                      type="text"
                      id="role"
                      name="role"
                      value={profileSettings.role}
                      onChange={handleProfileChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                      Location
                    </label>
                    <input
                      type="text"
                      id="location"
                      name="location"
                      value={profileSettings.location}
                      onChange={handleProfileChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="website" className="block text-sm font-medium text-gray-700">
                      Personal Website
                    </label>
                    <input
                      type="url"
                      id="website"
                      name="website"
                      value={profileSettings.website}
                      onChange={handleProfileChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
                      Bio
                    </label>
                    <textarea
                      id="bio"
                      name="bio"
                      rows={4}
                      value={profileSettings.bio}
                      onChange={handleProfileChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                    <p className="mt-1 text-xs text-gray-500">Brief description for your profile.</p>
                  </div>
                  
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader className="animate-spin -ml-1 mr-2 h-4 w-4" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Save Changes
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            )}
            
            {/* Notification Settings */}
            {activeTab === 'notifications' && (
              <form onSubmit={handleSave}>
                <div className="space-y-6">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Email Notifications</h3>
                    <div className="space-y-4">
                      <div className="flex items-start">
                        <div className="flex items-center h-5">
                          <input
                            id="emailNotifications"
                            name="emailNotifications"
                            type="checkbox"
                            checked={notificationSettings.emailNotifications}
                            onChange={handleNotificationChange}
                            className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                          />
                        </div>
                        <div className="ml-3">
                          <label htmlFor="emailNotifications" className="font-medium text-gray-700">Email notifications</label>
                          <p className="text-gray-500 text-sm">Receive email notifications for important updates.</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <div className="flex items-center h-5">
                          <input
                            id="projectUpdates"
                            name="projectUpdates"
                            type="checkbox"
                            checked={notificationSettings.projectUpdates}
                            onChange={handleNotificationChange}
                            className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                          />
                        </div>
                        <div className="ml-3">
                          <label htmlFor="projectUpdates" className="font-medium text-gray-700">Project updates</label>
                          <p className="text-gray-500 text-sm">Get notified when there are updates to your projects.</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <div className="flex items-center h-5">
                          <input
                            id="researchAlerts"
                            name="researchAlerts"
                            type="checkbox"
                            checked={notificationSettings.researchAlerts}
                            onChange={handleNotificationChange}
                            className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                          />
                        </div>
                        <div className="ml-3">
                          <label htmlFor="researchAlerts" className="font-medium text-gray-700">Research alerts</label>
                          <p className="text-gray-500 text-sm">Receive notifications about new research in your field.</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <div className="flex items-center h-5">
                          <input
                            id="citationAlerts"
                            name="citationAlerts"
                            type="checkbox"
                            checked={notificationSettings.citationAlerts}
                            onChange={handleNotificationChange}
                            className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                          />
                        </div>
                        <div className="ml-3">
                          <label htmlFor="citationAlerts" className="font-medium text-gray-700">Citation alerts</label>
                          <p className="text-gray-500 text-sm">Get notifications when your work is cited.</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <div className="flex items-center h-5">
                          <input
                            id="weeklyDigest"
                            name="weeklyDigest"
                            type="checkbox"
                            checked={notificationSettings.weeklyDigest}
                            onChange={handleNotificationChange}
                            className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                          />
                        </div>
                        <div className="ml-3">
                          <label htmlFor="weeklyDigest" className="font-medium text-gray-700">Weekly digest</label>
                          <p className="text-gray-500 text-sm">Receive a weekly summary of all activity.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">In-App Notifications</h3>
                    <div className="space-y-4">
                      <div className="flex items-start">
                        <div className="flex items-center h-5">
                          <input
                            id="chatNotifications"
                            name="chatNotifications"
                            type="checkbox"
                            checked={notificationSettings.chatNotifications}
                            onChange={handleNotificationChange}
                            className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                          />
                        </div>
                        <div className="ml-3">
                          <label htmlFor="chatNotifications" className="font-medium text-gray-700">Chat notifications</label>
                          <p className="text-gray-500 text-sm">Get notified of new chat messages.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader className="animate-spin -ml-1 mr-2 h-4 w-4" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Save Changes
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            )}
            
            {/* Privacy Settings */}
            {activeTab === 'privacy' && (
              <form onSubmit={handleSave}>
                <div className="space-y-6">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Privacy Settings</h3>
                    <div className="space-y-4">
                      <div className="flex items-start">
                        <div className="flex items-center h-5">
                          <input
                            id="showProfile"
                            name="showProfile"
                            type="checkbox"
                            checked={privacySettings.showProfile}
                            onChange={handlePrivacyChange}
                            className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                          />
                        </div>
                        <div className="ml-3">
                          <label htmlFor="showProfile" className="font-medium text-gray-700">Show profile to other users</label>
                          <p className="text-gray-500 text-sm">Allow other users to view your profile information.</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <div className="flex items-center h-5">
                          <input
                            id="showEmail"
                            name="showEmail"
                            type="checkbox"
                            checked={privacySettings.showEmail}
                            onChange={handlePrivacyChange}
                            className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                          />
                        </div>
                        <div className="ml-3">
                          <label htmlFor="showEmail" className="font-medium text-gray-700">Show email address</label>
                          <p className="text-gray-500 text-sm">Display your email address on your profile.</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <div className="flex items-center h-5">
                          <input
                            id="allowDirectMessages"
                            name="allowDirectMessages"
                            type="checkbox"
                            checked={privacySettings.allowDirectMessages}
                            onChange={handlePrivacyChange}
                            className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                          />
                        </div>
                        <div className="ml-3">
                          <label htmlFor="allowDirectMessages" className="font-medium text-gray-700">Allow direct messages</label>
                          <p className="text-gray-500 text-sm">Let other users send you direct messages.</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <div className="flex items-center h-5">
                          <input
                            id="publicSearchable"
                            name="publicSearchable"
                            type="checkbox"
                            checked={privacySettings.publicSearchable}
                            onChange={handlePrivacyChange}
                            className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                          />
                        </div>
                        <div className="ml-3">
                          <label htmlFor="publicSearchable" className="font-medium text-gray-700">Public searchable profile</label>
                          <p className="text-gray-500 text-sm">Allow your profile to appear in search results.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader className="animate-spin -ml-1 mr-2 h-4 w-4" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Save Changes
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            )}
            
            {/* Security Settings */}
            {activeTab === 'security' && (
              <form onSubmit={handleSave}>
                <div className="space-y-6">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Change Password</h3>
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">
                          Current Password
                        </label>
                        <div className="mt-1 relative">
                          <input
                            type={showPassword ? "text" : "password"}
                            id="currentPassword"
                            name="currentPassword"
                            value={securitySettings.currentPassword}
                            onChange={handleSecurityChange}
                            className="block w-full pr-10 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          />
                          <button
                            type="button"
                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? (
                              <EyeOff className="h-5 w-5 text-gray-400" />
                            ) : (
                              <Eye className="h-5 w-5 text-gray-400" />
                            )}
                          </button>
                        </div>
                      </div>
                      
                      <div>
                        <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                          New Password
                        </label>
                        <input
                          type="password"
                          id="newPassword"
                          name="newPassword"
                          value={securitySettings.newPassword}
                          onChange={handleSecurityChange}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                          Confirm New Password
                        </label>
                        <input
                          type="password"
                          id="confirmPassword"
                          name="confirmPassword"
                          value={securitySettings.confirmPassword}
                          onChange={handleSecurityChange}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Email Address</h3>
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                          Email
                        </label>
                        <div className="mt-1 flex rounded-md shadow-sm">
                          <input
                            type="email"
                            name="email"
                            id="email"
                            readOnly
                            value={user?.email || 'user@example.com'}
                            className="flex-1 min-w-0 block w-full px-3 py-2 rounded-md border border-gray-300 bg-gray-100 sm:text-sm"
                          />
                          <button
                            type="button"
                            className="ml-3 inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          >
                            <Mail className="mr-2 h-4 w-4" />
                            Change
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={isSubmitting || !securitySettings.currentPassword || !securitySettings.newPassword || !securitySettings.confirmPassword || securitySettings.newPassword !== securitySettings.confirmPassword}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader className="animate-spin -ml-1 mr-2 h-4 w-4" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Save Changes
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default withAuth(SettingsPage);