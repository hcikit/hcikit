import React from "react";
import { ConfigurationsProvider } from "./Configuration";

import { HashRouter as Router, Route, Switch } from "react-router-dom";
import Dashboard from "./Dashboard";
import RawLogs from "./RawLogs";

// TODO: how to deal with the fact that most configurations aren't actually "complete" because of the uploads?

// Idea: I could potentially just add a prop called "Last task"? Or search for the last upload task...

function App() {
  return (
    <ConfigurationsProvider>
      <div className="mx-auto px-10 py-5">
        <Router>
          <Switch>
            <Route path="/raw/:participant">
              <RawLogs />
            </Route>
            <Route path="/">
              <Dashboard />
            </Route>
          </Switch>
        </Router>
      </div>
    </ConfigurationsProvider>
  );
}

export default App;
