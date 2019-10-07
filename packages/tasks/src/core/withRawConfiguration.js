import { connect } from "react-redux";

export const withRawConfiguration = connect(state => {
  return { configuration: state.Configuration };
});
