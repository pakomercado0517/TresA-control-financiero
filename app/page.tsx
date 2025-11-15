import { redirect } from 'next/navigation';

export default function HomePage() {
  // Redirigir a dashboard por defecto
  redirect('/dashboard');
}
