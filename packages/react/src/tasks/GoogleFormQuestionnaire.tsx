import React, { useState } from "react";
import { withGridItem } from "../GridLayout";
import PropTypes from "prop-types";
import { useExperiment } from "../core/Experiment";

// TODO: THere are two ways to use the prefilled fields, either you want one from props, or you want to supply one directly... Or maybe just always from props? Either way the array is the wrong way to do it, it should be an object.

// TODO: multi page forms?
const GoogleFormQuestionnaire: React.FunctionComponent<{
  prefilledFields?: Record<string, string>;
  prefilledFieldsFromProps?: Record<string, string>;
  formId: string;
}> = ({ prefilledFields, prefilledFieldsFromProps, formId, ...props }) => {
  const experiment = useExperiment();
  let src = `https://docs.google.com/forms/d/e/${formId}/viewform?embedded=true`;

  const [hasLoaded, setHasLoaded] = useState(false);

  const extraProps = props as Record<string, string>;

  let urlString = "";

  if (prefilledFields) {
    urlString += Object.entries(prefilledFields)
      .map(([key, value]) => `${key}=${value}`)
      .join("&");
  }

  if (prefilledFieldsFromProps) {
    urlString += Object.entries(prefilledFieldsFromProps)
      .map(([key, prop]) => `${key}=${extraProps[prop]}`)
      .join("&");
  }

  if (urlString) {
    src = `${src}&${urlString}`;
  }

  function handleLoad() {
    if (hasLoaded) {
      experiment.advance();
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
  prefilledFields: PropTypes.objectOf(PropTypes.string.isRequired),
  prefilledFieldsFromProps: PropTypes.objectOf(PropTypes.string.isRequired),
};

export default withGridItem(GoogleFormQuestionnaire);
