import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const maxDuration = 300;

/**
 * 管理画面のボタンから呼ばれるラッパー。
 * サーバー側で CRON_SECRET を取得し、認証付きで /api/admin/backfill-ai を叩く。
 * クライアントに CRON_SECRET を露出させないためのプロキシ。
 */
export async function POST(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: 'CRON_SECRET が環境変数に設定されていません' },
      { status: 500 }
    );
  }

  const url = new URL('/api/admin/backfill-ai', request.url);

  try {
    const res = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${secret}` },
      cache: 'no-store',
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    return NextResponse.json(
      { error: 'バックフィル呼び出し失敗', detail: String(err) },
      { status: 500 }
    );
  }
}
