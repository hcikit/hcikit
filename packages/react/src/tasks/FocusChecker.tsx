import { noop } from "lodash-es";
import { useEffect, useState } from "react";
import ErrorOverlay from "../components/ErrorOverlay.js";
import { ControlFunctions } from "../core/Experiment.js";
import React from "react";

const FocusChecker: React.FunctionComponent<{
  log?: ControlFunctions["log"];
}> = ({ log = noop }) => {
  const [hasFocus, setHasFocus] = useState(() => document.hasFocus());

  useEffect(() => {
    function handleFocus() {
      setHasFocus(true);
      log({ type: "focus", focus: true });
    }

    function handleBlur() {
      setHasFocus(false);
      log({ type: "focus", focus: false });
    }

    log({ type: "focus", focus: document.hasFocus() });

    window.addEventListener("focus", handleFocus);
    window.addEventListener("blur", handleBlur);

    return () => {
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("blur", handleBlur);
    };
  }, [log]);

  if (hasFocus) {
    return null;
  } else {
    return (
      <ErrorOverlay>
        You must have the experiment in focus to continue.
      </ErrorOverlay>
    );
  }
};

export default FocusChecker;
