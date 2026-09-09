import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { DataProvider } from './context/DataContext'
import { NotificationProvider } from './context/NotificationContext'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <DataProvider>
      <NotificationProvider>
        <App />
      </NotificationProvider>
    </DataProvider>
  </React.StrictMode>
)
