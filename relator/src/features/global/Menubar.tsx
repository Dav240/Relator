import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarTrigger,
} from "../../ui/menubar";

function AppMenubar({ onNew }: { onNew: () => void }) {
  return (
    <Menubar className="h-7 rounded-none border-0 bg-transparent p-0 shadow-none">
      <MenubarMenu>
        <MenubarTrigger>File</MenubarTrigger>
        <MenubarContent>
          <MenubarItem onClick={onNew}>New</MenubarItem>
          <MenubarItem>Open</MenubarItem>
          <MenubarItem>Save</MenubarItem>
          <MenubarItem>Save as</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu>
        <MenubarTrigger>Export</MenubarTrigger>
        <MenubarContent>
          <MenubarItem>as Image</MenubarItem>
          <MenubarItem>as File</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  );
}

export { AppMenubar };
