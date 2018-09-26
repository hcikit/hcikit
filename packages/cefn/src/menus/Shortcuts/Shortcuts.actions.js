export const toggleModifier = modifier => ({
  type: TOGGLE_MODIFIER,
  modifier
});

export const setModifier = (modifier, value) => ({
  type: SET_MODIFIER,
  modifier,
  value
});

export const resetShortcuts = () => ({
  type: RESET_SHORTCUTS
});

export const addToPath = keys => ({
  type: ADD_TO_PATH,
  keys
});

export const delayOver = keys => ({
  type: DELAY_OVER
});

export const TOGGLE_MODIFIER = "TOGGLE_MODIFIER";
export const SET_MODIFIER = "SET_MODIFIER";
export const RESET_SHORTCUTS = "RESET_SHORTCUTS";
export const ADD_TO_PATH = "ADD_TO_PATH";
export const DELAY_OVER = "DELAY_OVER";
