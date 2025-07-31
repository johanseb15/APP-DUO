import React, { useState } from "react";
import AdminSidebar from "./AdminSidebar";
import MenuManagement from "./MenuManagement";
import OrderManagement from "./OrderManagement";
import ZoneManagement from "./ZoneManagement";
import NotificationManagement from "./NotificationManagement";
import { AuthContext } from "../AuthContext";

const AdminDashboard = () => {
  const { logout } = React.useContext(AuthContext);
  const [activeSection, setActiveSection] = useState('menu');

  const renderSection = () => {
    switch (activeSection) {
      case 'menu':
        return <MenuManagement />;
      case 'orders':
        return <OrderManagement />;
      case 'zones':
        return <ZoneManagement />;
      case 'notifications':
        return <NotificationManagement />;
      default:
        return <MenuManagement />;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar 
        activeSection={activeSection} 
        setActiveSection={setActiveSection}
        onLogout={logout}
      />
      <div className="flex-1 overflow-x-hidden">
        {renderSection()}
      </div>
    </div>
  );
};

export default AdminDashboard;