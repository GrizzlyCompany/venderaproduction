import { redirect } from 'next/navigation';
import { createServerClient } from '@/lib/supabase/server';

export default async function PerfilPage() {
  const supabase = createServerClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect('/login');
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>Bienvenido, {session.user.email}</h1>
      <p>Este contenido solo se muestra a usuarios autenticados.</p>
    </div>
  );
}