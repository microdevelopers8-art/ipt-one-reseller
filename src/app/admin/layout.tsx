import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import AdminSidebar from '@/components/AdminSidebar';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session || (session.role !== 'super_admin' && session.role !== 'admin')) {
    redirect('/login');
  }

  return (
    <div className="app-layout">
      <AdminSidebar userName={session.name} userRole={session.role} />
      <main className="main-content">
        <header className="header">
          <div className="header-left">
            <h1 className="header-title">IPT One Telecoms</h1>
            <span className="header-breadcrumb">/ Admin Management</span>
          </div>
          <div className="header-right">
            <div className="search-box">
              <span className="search-icon">🔍</span>
              <input type="text" className="search-input" placeholder="Search orders, products..." />
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
