import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const rows = await query('SELECT * FROM catalogs WHERE id = $1', [id]);
    if (!rows.length) return NextResponse.json({ error: 'Catalog not found' }, { status: 404 });
    return NextResponse.json({ catalog: rows[0] });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch catalog' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session || !['super_admin', 'admin'].includes(session.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const { name, slug, description, catalog_type, icon, color, is_active, sort_order } = body;

    const rows = await query(
      `UPDATE catalogs SET 
        name = COALESCE($1, name),
        slug = COALESCE($2, slug),
        description = COALESCE($3, description),
        catalog_type = COALESCE($4, catalog_type),
        icon = COALESCE($5, icon),
        color = COALESCE($6, color),
        is_active = COALESCE($7, is_active),
        sort_order = COALESCE($8, sort_order),
        updated_at = NOW()
       WHERE id = $9 RETURNING *`,
      [name, slug, description, catalog_type, icon, color, is_active, sort_order, id]
    );

    if (!rows.length) return NextResponse.json({ error: 'Catalog not found' }, { status: 404 });
    return NextResponse.json({ catalog: rows[0] });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update catalog' }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'super_admin') {
      return NextResponse.json({ error: 'Only super admins can delete catalogs' }, { status: 403 });
    }

    const { id } = await params;
    await query('DELETE FROM catalogs WHERE id = $1', [id]);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete catalog' }, { status: 500 });
  }
}
