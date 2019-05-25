import { ATTEMPT } from "./StimulusResponse.actions";

export default (state = { attempts: [] }, action) => {
  switch (action.type) {
    case ATTEMPT:
      action.attempt.time = Date.now();
      return { attempts: [...state.attempts, action.attempt] };
    default:
      return state;
  }
};
