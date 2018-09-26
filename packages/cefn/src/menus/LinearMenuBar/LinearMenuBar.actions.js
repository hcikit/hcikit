export const openMenu = menu => ({
  type: OPEN_MENU,
  menu
});
export const openAllMenus = () => ({
  type: OPEN_ALL_MENUS
});

export const closeAllMenus = () => ({
  type: CLOSE_ALL_MENUS
});
export const OPEN_MENU = "OPEN_MENU";
export const OPEN_ALL_MENUS = "OPEN_ALL_MENUS";
export const CLOSE_ALL_MENUS = "CLOSE_ALL_MENUS";
