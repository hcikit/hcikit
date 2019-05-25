import {
  ADD_TO_PATH,
  TOGGLE_MODIFIER,
  SET_MODIFIER,
  RESET_SHORTCUTS,
  DELAY_OVER
} from "./Shortcuts.actions";
import { some } from "lodash";

export default (
  state = { modifiersPressed: {}, path: [], delayTimeOver: false },
  action
) => {
  let modifiersPressed;
  let isPressed;
  let delayTimeOver;
  switch (action.type) {
    //TODOLATER: deduplicate
    case TOGGLE_MODIFIER:
      modifiersPressed = {
        ...state.modifiersPressed,
        [action.modifier]: !state.modifiersPressed[action.modifier]
      };
      isPressed = some(Object.values(modifiersPressed), Boolean);
      delayTimeOver = isPressed ? state.delayTimeOver : false;
      return {
        ...state,
        modifiersPressed,
        delayTimeOver
      };
    case SET_MODIFIER:
      modifiersPressed = {
        ...state.modifiersPressed,
        [action.modifier]: action.value
      };

      isPressed = some(Object.values(modifiersPressed), Boolean);
      delayTimeOver = isPressed ? state.delayTimeOver : false;

      return {
        ...state,
        modifiersPressed,
        delayTimeOver
      };

    case DELAY_OVER:
      return {
        ...state,
        delayTimeOver: true
      };
    case RESET_SHORTCUTS:
      return { modifiersPressed: {}, path: [], delayTimeOver: false };
    case ADD_TO_PATH:
      return { ...state, path: [...state.path, action.keys] };
    default:
      return state;
  }
};
