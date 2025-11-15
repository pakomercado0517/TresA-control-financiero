import { DashboardView } from './components/dashboard-view';
import { ProfileStatus } from '../components/profile-guard';

export default function DashboardPage() {
  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Visualiza tus métricas financieras y gestiona tus facturas
        </p>
      </div>

      <ProfileStatus />
      <DashboardView />
    </div>
  );
}
