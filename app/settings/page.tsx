import { ProfileSettings } from './components/profile-settings';

export default function SettingsPage() {
  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Configuración</h1>
        <p className="text-gray-600 mt-2">
          Configura tus datos y preferencias de validación
        </p>
      </div>

      <ProfileSettings />
    </div>
  );
}

