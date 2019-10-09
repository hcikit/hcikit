import { connect } from "react-redux";

export const withRawConfiguration = connect(configuration => ({
  configuration
}));
