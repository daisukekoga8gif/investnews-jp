/**
 * 日時を「〇分前」「〇時間前」などに変換
 */
export function formatDistanceToNow(dateStr: string | null): string {
  if (!dateStr) return '';

  try {
    const date = new Date(dateStr);
    const now = Date.now();
    const diffMs = now - date.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffMin < 1) return 'たった今';
    if (diffMin < 60) return `${diffMin}分前`;
    if (diffHour < 24) return `${diffHour}時間前`;
    if (diffDay < 7) return `${diffDay}日前`;

    return date.toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' });
  } catch {
    return '';
  }
}

/**
 * 日時をフルフォーマットで表示
 */
export function formatDateTime(dateStr: string | null): string {
  if (!dateStr) return '';
  try {
    return new Date(dateStr).toLocaleString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '';
  }
}
