export interface Category {
  id?: number;
  name: string;
  slaHours: number;
  ticketCount?: number;
}

export interface CategoryPayload {
  name: string;
  slaHours: number;
}