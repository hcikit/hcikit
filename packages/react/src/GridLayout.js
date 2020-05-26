import React from "react";
import PropTypes from "prop-types";

export function withGridItem(WrappedComponent, defaultGrid = "task") {
  let GridItem = (props) => {
    return (
      <div style={{ gridArea: props.gridArea || defaultGrid }}>
        <WrappedComponent {...props} />
      </div>
    );
  };
  GridItem.propTypes = { gridArea: PropTypes.string };

  return GridItem;
}

/**
 *
 * This component is a layout component that can be passed to an Experiment
 * using <Experimnent Layout={GridLayout}/>. This is already done by default
 */
let GridLayout = ({ children }) => {
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
