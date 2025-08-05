import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Tenders from './pages/Tenders';
import Documents from './pages/Documents';
import Reminders from './pages/Reminders';
import { TenderProvider } from './context/TenderContext';
import { ReminderProvider } from './context/ReminderContext';
import { DocumentProvider } from './context/DocumentContext';

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate initial loading
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading Chainfly...</p>
        </div>
      </div>
    );
  }

  return (
    <TenderProvider>
      <ReminderProvider>
        <DocumentProvider>
          <Router>
            <div className="min-h-screen bg-gray-50">
              <Navbar onMenuClick={() => setSidebarOpen(true)} />
              
              <div className="flex pt-16"> {/* Add top padding to account for fixed navbar */}
                <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
                
                <main className="flex-1 p-6 lg:p-8">
                  <div className="max-w-7xl mx-auto">
                    <Routes>
                      <Route path="/" element={<Dashboard />} />
                      <Route path="/tenders" element={<Tenders />} />
                      <Route path="/documents" element={<Documents />} />
                      <Route path="/reminders" element={<Reminders />} />
                    </Routes>
                  </div>
                </main>
              </div>
            </div>
          </Router>
        </DocumentProvider>
      </ReminderProvider>
    </TenderProvider>
  );
}

export default App;
