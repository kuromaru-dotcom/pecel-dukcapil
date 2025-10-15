import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

/**
 * Hook to sync documents with WebSocket updates
 * Automatically invalidates and refetches document queries when updates are received
 */
export function useDocumentSync() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const handleDocumentUpdate = (event: CustomEvent) => {
      console.log('[Sync] Document updated:', event.detail);
      
      // Invalidate all document queries to trigger refetch
      queryClient.invalidateQueries({ queryKey: ['/api/documents'] });
    };

    // Listen for document updates from WebSocket
    window.addEventListener('document_updated', handleDocumentUpdate as EventListener);

    return () => {
      window.removeEventListener('document_updated', handleDocumentUpdate as EventListener);
    };
  }, [queryClient]);
}
