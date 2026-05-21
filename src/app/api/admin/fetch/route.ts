import { NextResponse } from 'next/server';
import { fetchAllSources } from '@/lib/rss/fetcher';

export async function POST() {
  try {
    await fetchAllSources();
    return NextResponse.json({ success: true, message: 'ニュース取得完了' });
  } catch (error) {
    return NextResponse.json(
      { error: 'ニュース取得失敗', detail: String(error) },
      { status: 500 }
    );
  }
}
