import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category') || null;
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = Math.min(parseInt(searchParams.get('limit') || '20', 10), 50);
  const sortBy = searchParams.get('sortBy') || 'score';
  const offset = (page - 1) * limit;

  let query = supabase
    .from('articles')
    .select('*', { count: 'exact' })
    .eq('is_published', true)
    .eq('is_archived', false);

  if (category && category !== 'すべて') {
    query = query.eq('category', category);
  }

  if (sortBy === 'date') {
    query = query.order('original_published_at', { ascending: false });
  } else {
    query = query.order('score_total', { ascending: false });
  }

  query = query.range(offset, offset + limit - 1);

  const { data, count, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    articles: data || [],
    total: count || 0,
    page,
    totalPages: Math.ceil((count || 0) / limit),
  });
}
