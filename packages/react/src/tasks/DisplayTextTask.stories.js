import React from 'react';
import DisplayTextTask from './DisplayTextTask';
import { action } from '@storybook/addon-actions';

export default {
  title: 'DisplayTextTask',
};

export const Markdown = () => (
  <DisplayTextTask
    content={'This task can show short text.'}
    taskComplete={action('taskComplete')}
  />
);

Markdown.story = {
  name: 'markdown',
};
