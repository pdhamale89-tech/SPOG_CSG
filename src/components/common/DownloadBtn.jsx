import { downloadCsv } from '../../utils/csvExport';

export default function DownloadBtn({ filename, rows, title }) {
  return (
    <button className="dl-btn" title={title || 'Download CSV'} onClick={() => downloadCsv(filename, rows)}>⬇</button>
  );
}
