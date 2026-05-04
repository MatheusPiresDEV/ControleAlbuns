import { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { AlbumsSection } from './components/AlbumsSection';
import { TopLists } from './components/TopLists';
import { NextAlbums } from './components/NextAlbums';
import { DiscographiesNew } from './components/DiscographiesNew';
import { StatisticsAdvanced } from './components/StatisticsAdvanced';
import { ChangeLogSection } from './components/ChangeLogSection';
import { ResetData } from './components/ResetData';

export default function App() {
  const [activeSection, setActiveSection] = useState('dashboard');

  const renderSection = () => {
    switch (activeSection) {
      case 'dashboard':
        return <Dashboard />;
      case 'albums':
        return <AlbumsSection />;
      case 'top5':
        return <TopLists />;
      case 'next':
        return <NextAlbums />;
      case 'discographies':
        return <DiscographiesNew />;
      case 'statistics':
        return <StatisticsAdvanced />;
      case 'changelog':
        return <ChangeLogSection />;
      case 'reset':
        return <ResetData />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-screen bg-[#0a0a0a] overflow-hidden">
      <Sidebar activeSection={activeSection} onSectionChange={setActiveSection} />
      <div className="flex-1 overflow-y-auto">
        {renderSection()}
      </div>
    </div>
  );
}