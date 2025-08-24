// Global custom event typing for sidebar state broadcasts
export { }; // ensure this file is treated as a module

declare global {
  interface SidebarToggledDetail {
    isCollapsed: boolean;
  }

  interface WindowEventMap {
    sidebarToggled: CustomEvent<SidebarToggledDetail>;
  }
}
