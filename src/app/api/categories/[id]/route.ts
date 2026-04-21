import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const rows = await query('SELECT * FROM categories WHERE id = $1', [id]);
    if (!rows.length) return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    return NextResponse.json({ category: rows[0] });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch category' }, { status: 500 });
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
    const { name, slug, description, icon, sort_order, is_active, parent_id } = body;

    const rows = await query(
      `UPDATE categories SET 
        name = COALESCE($1, name),
        slug = COALESCE($2, slug),
        description = COALESCE($3, description),
        icon = COALESCE($4, icon),
        sort_order = COALESCE($5, sort_order),
        is_active = COALESCE($6, is_active),
        parent_id = $7,
        updated_at = NOW()
       WHERE id = $8 RETURNING *`,
      [name, slug, description, icon, sort_order, is_active, parent_id || null, id]
    );

    if (!rows.length) return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    return NextResponse.json({ category: rows[0] });
  } catch {
    return NextResponse.json({ error: 'Failed to update category' }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session || !['super_admin', 'admin'].includes(session.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { id } = await params;

    // 1. Unlink any products that belong to this category (or its children)
    await query('UPDATE products SET category_id = NULL WHERE category_id = $1 OR category_id IN (SELECT id FROM categories WHERE parent_id = $1)', [id]);

    // 2. Delete children categories
    await query('DELETE FROM categories WHERE parent_id = $1', [id]);

    // 3. Delete the category itself
    await query('DELETE FROM categories WHERE id = $1', [id]);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Delete Error", err)
    return NextResponse.json({ error: 'Failed to delete category: ' + err.message }, { status: 500 });
  }
}
