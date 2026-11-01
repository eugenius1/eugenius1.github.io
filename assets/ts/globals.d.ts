// jQuery and DataTables load from a CDN on the pages that use them

interface DataTableColumnNodes {
  map(callback: (node: HTMLElement) => string): unknown;
}

interface DataTableApi {
  $(selector: string): JQuery;
  clear(): void;
  column(index: number, options: { order: string }): { nodes(): DataTableColumnNodes };
  draw(): DataTableApi;
  on(event: string, handler: () => void): void;
  rows: { add(data: unknown[]): DataTableApi };
}

interface DataTableContext {
  api(): DataTableApi;
}

interface DataTableStatic {
  ext: {
    order: Record<string, (this: DataTableContext, settings: unknown, col: number) => unknown>;
  };
  render: { number(thousands: string, decimal: string): unknown };
}

interface JQuery {
  DataTable(options: unknown): DataTableApi;
  dataTable: DataTableStatic;
}
