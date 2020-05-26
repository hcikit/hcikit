import React from 'react';
import { ProgressBar } from './ProgressBar';

export default {
  title: 'ProgressBar',
};

export const Start = () => (
  <ProgressBar
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
  <ProgressBar
    configuration={{
      __INDEX__: [0, 1],
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

export const SecondFromEnd = () => (
  <ProgressBar
    configuration={{
      __INDEX__: [1, 1],
      children: [
        { task: 'Hello', children: [{}, {}, {}] },
        { task: 'World', children: [{}, {}, {}] },
      ],
    }}
  />
);

SecondFromEnd.story = {
  name: 'second from end',
};

export const End = () => (
  <ProgressBar
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

export const DepthStart = () => (
  <ProgressBar
    depth={1}
    configuration={{
      __INDEX__: [0, 0],
      children: [
        { task: 'Hello', children: [{}, {}, {}] },
        { task: 'World', children: [{}, {}, {}] },
      ],
    }}
  />
);

DepthStart.story = {
  name: 'depth start',
};

export const DepthMiddle = () => (
  <ProgressBar
    depth={1}
    configuration={{
      __INDEX__: [0, 1],
      children: [
        { task: 'Hello', children: [{}, {}, {}] },
        { task: 'World', children: [{}, {}, {}] },
      ],
    }}
  />
);

DepthMiddle.story = {
  name: 'depth middle',
};

export const DepthSecondFromEnd = () => (
  <ProgressBar
    depth={1}
    configuration={{
      __INDEX__: [1, 3],
      children: [
        { task: 'Hello', children: [{}, {}, {}] },
        { task: 'World', children: [{}, {}, {}, {}, {}] },
      ],
    }}
  />
);

DepthSecondFromEnd.story = {
  name: 'depth second from end',
};

export const DepthEnd = () => (
  <ProgressBar
    depth={1}
    configuration={{
      __INDEX__: [0, 2],
      children: [
        { task: 'Hello', children: [{}, {}, {}] },
        { task: 'World', children: [{}, {}, {}] },
      ],
    }}
  />
);

DepthEnd.story = {
  name: 'depth end',
};
