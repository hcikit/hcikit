import React from "react";
import PropTypes from "prop-types";

export function withGridItem<T extends Record<string, unknown>>(
  WrappedComponent: React.ComponentType<T>,
  defaultGrid = "task"
): React.FunctionComponent<{ gridArea?: string } & T> {
  //
  const GridItem: React.FunctionComponent<{ gridArea?: string } & T> = ({
    gridArea,
    ...props
  }) => {
    return (
      <div style={{ gridArea: gridArea ?? defaultGrid }}>
        <WrappedComponent {...(props as T)} />
      </div>
    );
  };

  // GridItem.propTypes = {
  //   gridArea: PropTypes.string,
  //   ...(WrappedComponent.propTypes ?? {}),
  // };

  return GridItem;
}

/**
 *
 * This component is a layout component that can be passed to an Experiment
 * using <Experimnent Layout={GridLayout}/>. This is already done by default
 */
const GridLayout: React.FunctionComponent = ({ children }) => {
  return (
    <div
      id="grid-layout"
      style={{
        display: "grid",
        width: "100%",
        height: "100%",
        gridTemplateColumns: "1fr",
        gridTemplateRows: "min-content 1fr min-content",
        gridTemplateAreas: `
      "header"
      "task"
      "footer"`,
      }}
    >
      {children}
    </div>
  );
};

GridLayout.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]).isRequired,
};

export default GridLayout;
