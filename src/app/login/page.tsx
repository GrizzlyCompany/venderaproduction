
import { requireGuest } from '@/lib/auth-helpers';
import LoginClient from './LoginClient';

export default async function LoginPage() {
  // ✅ Verificar que el usuario NO esté autenticado
  // Si ya está logueado, redirige automáticamente a la página principal
  await requireGuest();

  return <LoginClient />;
}
