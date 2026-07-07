import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
import NotificationsPanel from "../Notifications/NotificationsPanel";
import styles from "../../styles/Layout.module.css";

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const toggleNotifications = () => setNotificationsOpen(!notificationsOpen);

  return (
    <div className={styles.layout}>
      <Sidebar isOpen={sidebarOpen} toggle={toggleSidebar} />
      
      <main className={`${styles.main} ${sidebarOpen ? styles.withSidebar : styles.collapsed}`}>
        <Header 
          onToggleSidebar={toggleSidebar}
          onToggleNotifications={toggleNotifications}
        />
        
        <div className={styles.content}>
          <Outlet />
        </div>
      </main>

      <NotificationsPanel 
        isOpen={notificationsOpen} 
        onClose={() => setNotificationsOpen(false)} 
      />
    </div>
  );
}