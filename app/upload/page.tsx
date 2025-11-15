import { FileUploader } from './components/file-uploader';
import { InvoiceList } from './components/invoice-list';
import { ProfileGuard, ProfileStatus } from '../components/profile-guard';

export default function UploadPage() {
  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Ingresos</h1>
        <p className="text-gray-600 mt-2">
          Carga las facturas XML (CFDI) que has expedido en el mes
        </p>
      </div>

      <ProfileGuard mode="required" />
      <ProfileStatus />
      <FileUploader />
      <InvoiceList />
    </div>
  );
}

