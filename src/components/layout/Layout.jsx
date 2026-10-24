import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import HelpButton from '../common/HelpButton'; // <-- Importar
import './admin.css';

export default function Layout() {
  return (
    <div className="admin-layout">
      <Sidebar />
      <main className="admin-main">
        <Outlet />
      </main>
      <HelpButton /> {/* <-- Agregar aquí */}
    </div>
  );
}