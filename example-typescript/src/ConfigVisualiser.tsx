import { useConfiguration } from "@hcikit/react";
import { iterateConfiguration } from "@hcikit/workflow";

export const ConfigVisualiser: React.FC = () => {
  const config = useConfiguration();

  return new Array(iterateConfiguration(config)).map(() => {
    return <div className="aspect-square"></div>;
  });

  return null;
};
