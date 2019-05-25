import React from "react";
import PropTypes from "prop-types";

export function withGridItem(WrappedComponent, defaultGrid = "task") {
  let GridItem = props => {
    return (
      <div style={{ gridArea: defaultGrid || props.gridArea }}>
        <WrappedComponent {...props} />
      </div>
    );
  };
  GridItem.propTypes = { gridArea: PropTypes.string };

  return GridItem;
}
