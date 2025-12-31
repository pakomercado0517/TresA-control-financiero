import { DashboardView } from './components/dashboard-view';
import { ProfileStatus } from '../components/profile-guard';

export default function DashboardPage() {
  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <ProfileStatus />
      <DashboardView />
    </div>
  );
}
