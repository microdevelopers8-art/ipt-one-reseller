import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';

export default async function Home() {
  const session = await getSession();
  
  if (!session) {
    redirect('/login');
  }
  
  if (session.role === 'super_admin' || session.role === 'admin') {
    redirect('/admin/dashboard');
  }
  
  redirect('/reseller/dashboard');
}
