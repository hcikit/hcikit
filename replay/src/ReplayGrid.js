import React from "react";
import Replayer from "./Replayer";
import styled from "styled-components";

let Grid = styled.div`
  display: grid;
  grid-template-columns: ${({ columns }) => "1fr ".repeat(columns)};
`;

let ReplayGrid = ({ logs, transformTime, tasks }) => {
  let columns = Math.floor(Math.sqrt(logs.length));
  console.log(columns);
  let rows = 1;
  return (
    <Grid columns={columns} rows={rows}>
      {logs.map(log => (
        <Replayer
          tasks={tasks}
          log={log}
          index={[0, 0]}
          transformTime={transformTime}
          onReplayComplete={() => {}}
        />
      ))}
    </Grid>
  );
};

export default ReplayGrid;
