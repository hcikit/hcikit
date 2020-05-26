import React from 'react';
import { WizardProgress } from './WizardProgress';

export default {
  title: 'WizardProgress',
};

export const Start = () => (
  <WizardProgress
    configuration={{
      children: [
        { task: 'Hello', children: [{}, {}, {}] },
        { task: 'World', children: [{}, {}, {}] },
        { task: 'you', children: [{}, {}, {}] },
      ],
    }}
  />
);

Start.story = {
  name: 'start',
};

export const Middle = () => (
  <WizardProgress
    configuration={{
      __INDEX__: [1, 1],
      children: [
        { task: 'Hello', children: [{}, {}, {}] },
        { task: 'World', children: [{}, {}, {}] },
        { task: 'you', children: [{}, {}, {}] },
      ],
    }}
  />
);

Middle.story = {
  name: 'middle',
};

export const End = () => (
  <WizardProgress
    configuration={{
      __INDEX__: [2, 2],
      children: [
        { task: 'Hello', children: [{}, {}, {}] },
        { task: 'World', children: [{}, {}, {}] },
        { task: 'You', children: [{}, {}, {}] },
      ],
    }}
  />
);

End.story = {
  name: 'end',
};
