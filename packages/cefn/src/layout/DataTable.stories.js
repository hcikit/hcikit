import React from "react";

import { storiesOf } from "@storybook/react";
import { DataTable } from "./DataTable";

let data = [
  {
    title: "hello world",
    description: "yoyoyoy",
    rating: 10,
    onlyOnce: "hello",
    extra: "dude"
  },
  { title: "dude", description: "car", rating: 0, extra: "dude" }
];

storiesOf("layout/DataTable", module).add("DataTable", () => (
  <DataTable
    columns={[
      { title: "Title", key: "title" },
      { key: "description" },
      { key: "rating", numeric: true },
      { key: "onlyOnce" }
    ]}
    fetchData={() => Promise.resolve(data)}
  />
));
