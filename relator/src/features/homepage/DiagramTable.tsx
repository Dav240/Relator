import { ScrollArea } from "../../ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../ui/table";

type DiagramFile = {
  created_at: number | null;
  modified_at: number | null;
  name: string;
  path: string;
};

function formatTimestamp(timestamp: number | null) {
  if (!timestamp) {
    return "Unknown";
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(timestamp));
}

function DiagramTable({
  diagrams,
  onDelete,
  onOpen,
}: {
  diagrams: DiagramFile[];
  onDelete: (path: string) => void;
  onOpen: (path: string) => void;
}) {
  return (
    <ScrollArea className="h-full w-full rounded-sm border bg-background">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Created At</TableHead>
            <TableHead>Last Modified</TableHead>
            <TableHead>Name</TableHead>
            <TableHead className="w-28">Open</TableHead>
            <TableHead className="w-28">Delete</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {diagrams.map((diagram) => (
            <TableRow key={diagram.path}>
              <TableCell>{formatTimestamp(diagram.created_at)}</TableCell>
              <TableCell>{formatTimestamp(diagram.modified_at)}</TableCell>
              <TableCell>{diagram.name}</TableCell>
              <TableCell>
                <button
                  className="rounded-sm border px-2 py-1 text-sm hover:bg-muted"
                  onClick={() => onOpen(diagram.path)}
                  type="button"
                >
                  Open
                </button>
              </TableCell>
              <TableCell>
                <button
                  className="rounded-sm border px-2 py-1 text-sm hover:bg-muted"
                  onClick={() => onDelete(diagram.path)}
                  type="button"
                >
                  Delete
                </button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </ScrollArea>
  );
}

export { DiagramTable };
export type { DiagramFile };
