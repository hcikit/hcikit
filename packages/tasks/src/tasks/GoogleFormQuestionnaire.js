import React, { useState } from "react";
import { withGridItem } from "../withGridItem";

// TODO: ideally this should prefill as many fields as you would like.

const GoogleFormQuestionnaire = ({
  prefillParticipant,
  formId,
  participant,
  onAdvanceWorkflow
}) => {
  let src = `https://docs.google.com/forms/d/e/${formId}/viewform?embedded=true`;

  const [hasLoaded, setHasLoaded] = useState();

  if (prefillParticipant) {
    src = `${src}&${prefillParticipant}=${participant}`;
  }

  function handleLoad() {
    if (hasLoaded) {
      onAdvanceWorkflow();
    } else {
      setHasLoaded(true);
    }
  }
  return (
    <iframe
      style={{
        width: "100%",
        height: "100vh"
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

export default withGridItem(GoogleFormQuestionnaire);
