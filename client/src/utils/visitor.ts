export function getOrCreateVisitorId(): string {
  let id = localStorage.getItem('serena_visitor_id');
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem('serena_visitor_id', id);
  }
  return id;
}
