import { FilePlusIcon } from "lucide-react";

import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "../../ui/empty";

function EmptyState() {
  return (
    <Empty className="min-h-full rounded-sm border bg-background">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <FilePlusIcon />
        </EmptyMedia>
        <EmptyTitle>No diagrams yet</EmptyTitle>
        <EmptyDescription>
          Create or save a .relator file in the diagrams folder to see it here.
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}

export { EmptyState };
