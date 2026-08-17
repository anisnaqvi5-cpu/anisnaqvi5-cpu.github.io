// Shared error type for every server service (orders, catalog, content,
// admin). Kept in its own module so services can throw/catch it without
// circular imports between orderService.ts and catalogService.ts etc.
export class OrderError extends Error {
  constructor(public code: string, message: string) {
    super(message);
  }
}
