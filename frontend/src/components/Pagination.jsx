export default function Pagination({ page, pages, onPage }) {
  if (pages <= 1) return null;
  const prev = () => onPage(Math.max(page - 1, 1));
  const next = () => onPage(Math.min(page + 1, pages));

  return (
    <div className="row" style={{ marginTop: 12 }}>
      <button onClick={prev} disabled={page <= 1}>← Prev</button>
      <span>Page {page} / {pages}</span>
      <button onClick={next} disabled={page >= pages}>Next →</button>
    </div>
  );
}
