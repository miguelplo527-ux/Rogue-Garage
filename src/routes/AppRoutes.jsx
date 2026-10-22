import { Routes, Route, Navigate } from 'react-router-dom';
import { ROUTES } from '../config/routes';

import HomePage from '../pages/public/HomePage';
import CatalogPage from '../pages/public/CatalogPage';
import ProductDetailPage from '../pages/public/ProductDetailPage';
import ContactPage from '../pages/public/ContactPage';
import LoginPage from '../pages/auth/LoginPage';

import Layout from '../components/layout/Layout';
import DashboardPage from '../pages/admin/DashboardPage';
import ProductsPage from '../pages/admin/ProductsPage';
import InventoryPage from '../pages/admin/InventoryPage';
import SalesPage from '../pages/admin/SalesPage';
import PurchasesPage from '../pages/admin/PurchasesPage';
import FinancePage from '../pages/admin/FinancePage';
import SuppliersPage from '../pages/admin/SuppliersPage';
import EmployeesPage from '../pages/admin/EmployeesPage';
import SettingsPage from '../pages/admin/SettingsPage';
import HelpPage from '../pages/admin/HelpPage';
import ProtectedRoute from './ProtectedRoute';
import AdminRoute from './AdminRoute';

export default function AppRoutes() {
  return (
    <Routes>
      {/* RUTAS PUBLICAS */}
      <Route path={ROUTES.HOME} element={<HomePage />} />
      <Route path={ROUTES.CATALOG} element={<CatalogPage />} />
      <Route path="/producto/:id" element={<ProductDetailPage />} />
      <Route path={ROUTES.CONTACT} element={<ContactPage />} />
      <Route path={ROUTES.LOGIN} element={<LoginPage />} />

      {/* RUTAS PRIVADAS (ADMIN) */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AdminRoute />}>
          <Route path={ROUTES.ADMIN.DASHBOARD} element={<Layout />}>
            <Route index element={<DashboardPage />} />
            <Route path="productos" element={<ProductsPage />} />
            <Route path='inventario' element={<InventoryPage />} />
            <Route path='compras' element={<PurchasesPage />} />
            <Route path="ventas" element={<SalesPage />} />    
            <Route path="finanzas" element={<FinancePage />} />
            <Route path="proveedores" element={<SuppliersPage />} />
            <Route path="empleados" element={<EmployeesPage />} />
            <Route path="configuracion" element={<SettingsPage />} />
            <Route path='ayuda' element={<HelpPage />} />
          </Route>
        </Route>
      </Route>

      {/* REDIRECCIÓN POR DEFECTO */}
      <Route path="*" element={<Navigate to={ROUTES.HOME} replace />} />
    </Routes>
  );
}