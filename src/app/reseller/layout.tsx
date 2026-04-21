import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import ResellerSidebar from '@/components/ResellerSidebar';

export default async function ResellerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session || session.role !== 'reseller') {
    if (session?.role === 'super_admin' || session?.role === 'admin') {
      redirect('/admin/dashboard');
    }
    redirect('/login');
  }

  if (session.application_status !== 'approved') {
    redirect('/application');
  }


  return (
    <div className="app-layout">
      <ResellerSidebar userName={session.name} />
      <main className="main-content">
        <header className="header">
          <div className="header-left">
            <h1 className="header-title">IPT One Reseller</h1>
            <span className="header-breadcrumb">/ Dashboard</span>
          </div>
          <div className="header-right">
            <div className="search-box">
              <span className="search-icon">🔍</span>
              <input type="text" className="search-input" placeholder="Search products..." />
            </div>
            <div className="avatar">
              {session.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
            </div>
          </div>
        </header>
        <div className="page-content">
          {children}
        </div>
      </main>
    </div>
  );
}
