import { AuthLayout } from '../components/auth-layout';
import { LoginForm } from '../components/login-form';

export default function LoginPage() {
  return (
    <AuthLayout
      title="Iniciar Sesión"
      subtitle="O"
      linkText="crea una cuenta nueva"
      linkHref="/auth/register"
    >
      <LoginForm />
    </AuthLayout>
  );
}

