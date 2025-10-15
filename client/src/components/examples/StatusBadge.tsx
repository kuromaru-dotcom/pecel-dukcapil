import StatusBadge from '../StatusBadge';

export default function StatusBadgeExample() {
  return (
    <div className="flex gap-2 p-4">
      <StatusBadge status="DITERIMA" />
      <StatusBadge status="DIPROSES" />
      <StatusBadge status="DITUNDA" />
    </div>
  );
}
