import { ExpenseUploader } from './components/expense-uploader';
import { ManualExpenseForm } from './components/manual-expense-form';
import { ExpenseList } from './components/expense-list';
import { ProfileGuard, ProfileStatus } from '../components/profile-guard';

export default function ExpensesPage() {
  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Gastos y Compras</h1>
        <p className="text-gray-600 mt-2">
          Carga facturas XML de tus compras o ingresa gastos manualmente
        </p>
      </div>

      <ProfileGuard mode="required" />
      <ProfileStatus />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <ExpenseUploader />
        <ManualExpenseForm />
      </div>

      <ExpenseList />
    </div>
  );
}

