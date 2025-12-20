import React from 'react';
import Dashboard from './components/Dashboard';

function App() {
  // Mock user data for dashboard
  const mockUser = {
    id: 1,
    name: 'John Student',
    email: 'john@student.com',
    role: 'student',
    studentId: 'STU001',
    faceRegistered: true
  };

  return (
    <div className="App">
      <Dashboard user={mockUser} />
    </div>
  );
}

export default App;