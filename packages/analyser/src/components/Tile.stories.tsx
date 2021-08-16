import React from "react";
import { ComponentStory, ComponentMeta } from "@storybook/react";

import Tile, { TileGroup } from "./Tile";

export default {
  title: "Tile",
  component: Tile,
  argTypes: {
    backgroundColor: { control: "color" },
  },
} as ComponentMeta<typeof Tile>;

const Template: ComponentStory<typeof Tile> = (args) => <Tile {...args} />;

export const Default = Template.bind({});
Default.args = {
  value: 100,
  label: "value",
};

const GroupTemplate: ComponentStory<typeof TileGroup> = () => (
  <TileGroup>
    <Tile value={100} label="test" />
    <Tile value={10} label="RPM" />
    <Tile value={56} label="Bigger test" />
  </TileGroup>
);

export const Group = GroupTemplate.bind({});
