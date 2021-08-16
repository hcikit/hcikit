import { find } from "lodash";
import { useParams } from "react-router-dom";
import { useConfigurations } from "./Configuration";

const RawLogs: React.FunctionComponent = () => {
  let configurations = useConfigurations();
  let { participant } = useParams<{ participant: string }>();
  let configuration = find(configurations, { participant });

  if (!configuration) {
    return <div>Logs not found</div>;
  }

  return <pre>{JSON.stringify(configuration, null, 2)}</pre>;
};

export default RawLogs;
