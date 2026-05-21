import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const body = await request.json();
  const { is_published, category, score_total } = body;

  const updates: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (typeof is_published === 'boolean') updates.is_published = is_published;
  if (category) updates.category = category;
  if (typeof score_total === 'number') updates.score_total = score_total;

  const { data, error } = await supabaseAdmin
    .from('articles')
    .update(updates)
    .eq('id', params.id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ article: data });
}
