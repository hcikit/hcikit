import React from 'react';

import { action } from '@storybook/addon-actions';

import { DevTools } from './DevTools';

export default {
  title: 'DevTools',
};

export const Start = () => (
  <DevTools
    taskComplete={action('next task')}
    configuration={{
      children: [
        { task: 'Hello', children: [{}, {}, {}] },
        { task: 'World', children: [{}, {}, {}] },
      ],
    }}
  />
);

Start.story = {
  name: 'start',
};

export const Middle = () => (
  <DevTools
    taskComplete={action('next task')}
    configuration={{
      __INDEX__: [1, 0],
      children: [
        { task: 'Hello', children: [{}, {}, {}] },
        { task: 'World', children: [{}, {}, {}] },
      ],
    }}
  />
);

Middle.story = {
  name: 'middle',
};

export const End = () => (
  <DevTools
    taskComplete={action('next task')}
    configuration={{
      __INDEX__: [1, 2],
      children: [
        { task: 'Hello', children: [{}, {}, {}] },
        { task: 'World', children: [{}, {}, {}] },
      ],
    }}
  />
);

End.story = {
  name: 'end',
};
