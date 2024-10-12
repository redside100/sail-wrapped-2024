import { createContext, useEffect, useState } from 'react'
import './App.css'
import MainView from './MainView';

export const UserContext = createContext({});
function App() {
  const [user, setUser] = useState({})

  useEffect(() => {
    
  }, []);
  return (
    <UserContext.Provider value={user}>
      <MainView />
    </UserContext.Provider>
  )
}

export default App
