import { AuthLayout } from '../components/auth-layout';
import { RegisterForm } from '../components/register-form';

export default function RegisterPage() {
  return (
    <AuthLayout
      title="Crear Cuenta"
      subtitle="O"
      linkText="inicia sesión si ya tienes cuenta"
      linkHref="/auth/login"
    >
      <RegisterForm />
    </AuthLayout>
  );
}

