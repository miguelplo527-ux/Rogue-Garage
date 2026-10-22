import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import './admin.css';
export default function Layout() { return <div className='admin-layout'><Sidebar /><main className='admin-main'><Outlet /></main></div>; }
