import { getMessage } from "@extend-chrome/messages";
import { Configuration, ExperimentIndex } from "@hcikit/workflow";

export const [sendConfig, configStream, waitForConfig] =
  getMessage<Configuration>("CONFIG");

export const [sendAdvance, advanceStream, waitForAdvance] = getMessage<{
  index?: ExperimentIndex;
}>("ADVANCE");
