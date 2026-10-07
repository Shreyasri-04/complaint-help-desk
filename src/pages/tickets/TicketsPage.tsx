import { TicketListPage } from '@/pages/tickets/TicketListPage';

/**
 * Backwards-compatible alias: existing routes import `TicketsPage`.
 * The canonical implementation lives in `TicketListPage`.
 */
export function TicketsPage() {
  return <TicketListPage />;
}
