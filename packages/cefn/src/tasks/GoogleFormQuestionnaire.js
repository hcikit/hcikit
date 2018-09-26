import React from "react";

export default class extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  handleLoad = e => {
    if (this.state.hasLoaded) {
      this.props.onAdvanceWorkflow();
    } else {
      this.setState({ hasLoaded: true });
    }
  };

  render() {
    let { prefillParticipant, formId, participant } = this.props;

    let src = `https://docs.google.com/forms/d/e/${formId}/viewform?embedded=true`;

    if (prefillParticipant) {
      src = `${src}&${prefillParticipant}=${participant}`;
    }

    return (
      <iframe
        style={{
          width: "100%",
          height: "100vh"
        }}
        ref="iframe"
        title="Questionnaire"
        src={src}
        frameBorder="0"
        marginHeight="0"
        marginWidth="0"
        onLoad={this.handleLoad}
      >
        Loading...
      </iframe>
    );
  }
}

//entry.812855120
