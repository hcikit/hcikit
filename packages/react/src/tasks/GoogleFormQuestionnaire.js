import React, { useState } from "react";
import { withGridItem } from "../GridLayout";
import PropTypes from "prop-types";

// TODO: ideally this should prefill as many fields as you would like.
// TODO: multi page forms?

const GoogleFormQuestionnaire = ({
  prefillParticipant,
  formId,
  participant,
  taskComplete,
}) => {
  let src = `https://docs.google.com/forms/d/e/${formId}/viewform?embedded=true`;

  const [hasLoaded, setHasLoaded] = useState();

  if (prefillParticipant) {
    src = `${src}&${prefillParticipant}=${participant}`;
  }

  function handleLoad() {
    if (hasLoaded) {
      taskComplete();
    } else {
      setHasLoaded(true);
    }
  }
  return (
    <iframe
      style={{
        width: "100%",
        height: "100vh",
      }}
      // ref='iframe'
      title="Questionnaire"
      src={src}
      frameBorder="0"
      marginHeight="0"
      marginWidth="0"
      onLoad={handleLoad}
    >
      Loading...
    </iframe>
  );
};

GoogleFormQuestionnaire.propTypes = {
  formId: PropTypes.string,
  taskComplete: PropTypes.func,
  participant: PropTypes.string,
  prefillParticipant: PropTypes.string,
};

export default withGridItem(GoogleFormQuestionnaire);
