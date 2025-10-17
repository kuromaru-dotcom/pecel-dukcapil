import { useEffect, useRef, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import StatusBadge from "./StatusBadge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import type { Document } from "@shared/schema";

interface AutoScrollTableProps {
  title: string;
  documents: Document[];
  statusColor: string;
  scrollPosition?: number;
  onPauseChange?: (paused: boolean) => void;
}

export default function AutoScrollTable({ title, documents, statusColor, scrollPosition = 0, onPauseChange }: AutoScrollTableProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;

    scrollContainer.scrollTop = scrollPosition;
  }, [scrollPosition]);

  const doubledDocuments = [...documents, ...documents];

  return (
    <Card className={`border-t-4 rounded-2xl shadow-sm overflow-hidden`} style={{ borderTopColor: statusColor }}>
      <CardHeader className="pb-3 bg-muted/30">
        <CardTitle className="text-lg font-bold">{title}</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div 
          ref={scrollRef}
          className="h-[400px] overflow-hidden relative"
          onMouseEnter={() => onPauseChange?.(true)}
          onMouseLeave={() => onPauseChange?.(false)}
        >
          <Table>
            <TableHeader className="sticky top-0 bg-background z-10">
              <TableRow>
                <TableHead className="text-xs">NAMA</TableHead>
                <TableHead className="text-xs">JENIS DOKUMEN</TableHead>
                <TableHead className="text-xs">STATUS</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {doubledDocuments.map((doc, index) => (
                <TableRow key={`${doc.id}-${index}`}>
                  <TableCell className="text-xs">{doc.nama}</TableCell>
                  <TableCell className="text-xs">{doc.jenisDokumen}</TableCell>
                  <TableCell className="text-xs">
                    <StatusBadge status={doc.status as 'DITERIMA' | 'DIPROSES' | 'DITUNDA' | 'SELESAI'} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
