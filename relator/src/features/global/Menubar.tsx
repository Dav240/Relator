import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarTrigger,
} from "../../ui/menubar";
import { Switch } from "../../ui/switch";

function AppMenubar({
  isDarkMode,
  onDarkModeChange,
  onNew,
  onOpen,
  onExportFile,
  onExportImage,
  onSave,
  onSaveAs,
}: {
  isDarkMode: boolean;
  onDarkModeChange: (isDarkMode: boolean) => void;
  onNew: () => void;
  onOpen?: () => void;
  onExportFile?: () => void;
  onExportImage?: () => void;
  onSave?: () => void;
  onSaveAs?: () => void;
}) {
  return (
    <Menubar className="h-7 rounded-none border-0 bg-transparent p-0 shadow-none">
      <MenubarMenu>
        <MenubarTrigger>File</MenubarTrigger>
        <MenubarContent>
          <MenubarItem onClick={() => onNew()}>New</MenubarItem>
          <MenubarItem onClick={() => onOpen?.()}>Open</MenubarItem>
          <MenubarItem onClick={() => onSave?.()}>Save</MenubarItem>
          <MenubarItem onClick={() => onSaveAs?.()}>Save as</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu>
        <MenubarTrigger>Export</MenubarTrigger>
        <MenubarContent>
          <MenubarItem onClick={() => onExportImage?.()}>as Image</MenubarItem>
          <MenubarItem onClick={() => onExportFile?.()}>as PDF</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
      <div className="flex h-full items-center px-1.5">
        <Switch
          aria-label="Toggle dark mode"
          checked={isDarkMode}
          onCheckedChange={onDarkModeChange}
          size="sm"
        />
      </div>
    </Menubar>
  );
}

export { AppMenubar };
