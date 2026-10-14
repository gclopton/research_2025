import {HistoryRow} from './history-model';
/** Practice contributes to learning history, never to assessment grade summaries. */
export function gradebookHistory(rows:HistoryRow[]):HistoryRow[]{return rows.filter(row=>row.source==='exam');}
