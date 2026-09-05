import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarTrigger,
} from "../../ui/menubar";

function AppMenubar({
  onNew,
  onOpen,
  onSave,
}: {
  onNew: () => void;
  onOpen?: () => void;
  onSave?: () => void;
}) {
  return (
    <Menubar className="h-7 rounded-none border-0 bg-transparent p-0 shadow-none">
      <MenubarMenu>
        <MenubarTrigger>File</MenubarTrigger>
        <MenubarContent>
          <MenubarItem onClick={onNew}>New</MenubarItem>
          <MenubarItem onClick={onOpen}>Open</MenubarItem>
          <MenubarItem onClick={onSave}>Save</MenubarItem>
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
