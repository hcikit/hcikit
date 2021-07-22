import React, { useState } from "react";
import { withGridItem } from "../GridLayout";
import PropTypes from "prop-types";
import { useExperiment } from "../core/Experiment";

// TODO: multi page forms?
const GoogleFormQuestionnaire: React.FunctionComponent<{
  prefilledFields?: Array<string>;
  formId: string;
}> = ({ prefilledFields, formId, ...props }) => {
  const experiment = useExperiment();
  let src = `https://docs.google.com/forms/d/e/${formId}/viewform?embedded=true`;

  const [hasLoaded, setHasLoaded] = useState(false);

  const extraProps = props as Record<string, string>;

  if (prefilledFields) {
    src = `${src}&${prefilledFields
      .map((key) => `${key}=${extraProps[key]}`)
      .join("&")}`;
  }

  function handleLoad() {
    if (hasLoaded) {
      experiment.taskComplete();
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
      marginHeight={0}
      marginWidth={0}
      onLoad={handleLoad}
    >
      Loading...
    </iframe>
  );
};

GoogleFormQuestionnaire.propTypes = {
  formId: PropTypes.string.isRequired,
  prefilledFields: PropTypes.arrayOf(PropTypes.string.isRequired),
};

export default withGridItem(GoogleFormQuestionnaire);
