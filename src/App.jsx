import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Login } from './pages/Login';
import { Onboarding } from './pages/Onboarding';
import { Home } from './pages/Home';
import { Progress } from './pages/Progress';
import { Lens } from './pages/Lens';
import { Community } from './pages/Community';
import { Profile } from './pages/Profile';
import { Header } from './components/Header';
import { Navigation } from './components/Navigation';
import { Toast } from './components/Toast';
import { AICoach } from './components/AICoach';

const DashboardContent = () => {
  const { currentUser, userProfile, activeTab } = useApp();

  if (!currentUser) {
    return <Login />;
  }

  if (!userProfile) {
    return <Onboarding />;
  }

  return (
    <>
      <main id="mainApp" className="min-h-screen px-4 py-5 sm:px-6 lg:px-8 pb-28 md:pb-24">
        {/* Top Header Profile Widgets */}
        <Header />
        
        {/* Dynamic Tab Selector Panel */}
        <div className="max-w-[1600px] mx-auto min-h-[75vh] mt-4">
          {activeTab === 'home' && <Home />}
          {activeTab === 'progress' && <Progress />}
          {activeTab === 'lens' && <Lens />}
          {activeTab === 'community' && <Community />}
          {activeTab === 'profile' && <Profile />}
        </div>

        {/* Global Floating AI Coach Dialog */}
        <AICoach />

        {/* Global Bottom Navigation Dock */}
        <Navigation />
      </main>

      {/* Global Notification system */}
      <Toast />
    </>
  );
};

function App() {
  return (
    <AppProvider>
      <DashboardContent />
    </AppProvider>
  );
}

export default App;
