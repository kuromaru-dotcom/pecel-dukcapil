import { Badge } from "@/components/ui/badge";

interface StatusBadgeProps {
  status: 'DITERIMA' | 'DIPROSES' | 'DITUNDA' | 'SELESAI';
}

const statusConfig = {
  DITERIMA: {
    label: 'DITERIMA',
    className: 'bg-document-blue/90 text-white border-0 shadow-sm',
  },
  DIPROSES: {
    label: 'DIPROSES',
    className: 'bg-document-orange/90 text-white border-0 shadow-sm',
  },
  DITUNDA: {
    label: 'DITUNDA',
    className: 'bg-document-red/90 text-white border-0 shadow-sm',
  },
  SELESAI: {
    label: 'SELESAI',
    className: 'bg-document-green/90 text-white border-0 shadow-sm',
  },
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status];
  
  return (
    <Badge 
      className={`${config.className} rounded-full px-3 py-1`}
      data-testid={`badge-status-${status.toLowerCase()}`}
      role="status"
      aria-label={`Status dokumen: ${config.label}`}
    >
      {config.label}
    </Badge>
  );
}
