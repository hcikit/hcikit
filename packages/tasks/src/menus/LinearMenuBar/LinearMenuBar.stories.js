import React from 'react'
import { storiesOf } from '@storybook/react'
import { action } from '@storybook/addon-actions'
import { withKnobs, number } from '@storybook/addon-knobs'

import LinearMenuBar, { LinearMenu, ExposeHK } from './LinearMenuBar'
import {
  all_hierarchies,
  menuToCommandHierarchy
} from '../Shortcuts/CommandHierarchies'
import configureStore from '../../core/configureStore'
import { Provider } from 'react-redux'

const testMenu = [
  {
    title: 'animals',
    color: 'dark-red',
    items: [
      {
        command: 'cat',
        shortcut: [['shift', '2']]
      },
      {
        command: 'duck',
        shortcut: [['shift', 'q']]
      },
      {
        command: 'fish',
        shortcut: [['shift', 'a']]
      },
      {
        command: 'dog',
        shortcut: [['shift', 'w']]
      },
      {
        command: 'penguin',
        shortcut: [['shift', 'z']]
      },
      {
        command: 'bat',
        shortcut: [['shift', 's']]
      },
      {
        command: 'pigeon',
        shortcut: [['shift', '1']]
      }
    ]
  },
  {
    title: 'fruits',
    color: 'yellow',
    items: [
      {
        command: 'apple',
        shortcut: [['shift', 'e']]
      },
      {
        command: 'pear',
        shortcut: [['shift', '3']]
      },
      {
        command: 'peach',
        shortcut: [['shift', 'v']]
      },
      {
        command: 'pineapple',
        shortcut: [['shift', '4']]
      },
      {
        command: 'watermelon',
        shortcut: [['shift', 'c']]
      },
      {
        command: 'grapes',
        shortcut: [['shift', 'f']]
      },
      {
        command: 'lemon',
        shortcut: [['shift', 'r']]
      }
    ]
  },
  {
    title: 'office',
    color: 'turqoise',
    items: [
      {
        command: 'desk',
        shortcut: [['shift', '6']]
      },
      {
        command: 'printer',
        shortcut: [['shift', 't']]
      },
      {
        command: 'mouse',
        shortcut: [['shift', 'b']]
      },
      {
        command: 'paperclip',
        shortcut: [['shift', 'h']]
      },
      {
        command: 'keyboard',
        shortcut: [['shift', 'y']]
      },
      {
        command: 'stapler',
        shortcut: [['shift', 'g']]
      },
      {
        command: 'chair',
        shortcut: [['shift', 'n']]
      }
    ]
  },
  {
    title: 'clothing',
    color: 'purple',
    items: [
      {
        command: 'boot',
        shortcut: [['shift', 'k']]
      },
      {
        command: 'bowtie',
        shortcut: [['shift', 'm']]
      },
      {
        command: 'belt',
        shortcut: [['shift', 'u']]
      },
      {
        command: 'jacket',
        shortcut: [['shift', ',']]
      },
      {
        command: 'socks',
        shortcut: [['shift', '7']]
      },
      {
        command: 'bikini',
        shortcut: [['shift', '8']]
      },
      {
        command: 'pants',
        shortcut: [['shift', 'j']]
      }
    ]
  },
  {
    title: 'recreation',
    color: 'dark-blue',
    items: [
      {
        command: 'racket',
        shortcut: [['shift', 'o']]
      },
      {
        command: 'golf',
        shortcut: [['shift', '0']]
      },
      {
        command: 'bowling',
        shortcut: [['shift', 'l']]
      },
      {
        command: 'puzzle',
        shortcut: [['shift', '/']]
      },
      {
        command: 'karate',
        shortcut: [['shift', 'p']]
      },
      {
        command: 'basketball',
        shortcut: [['shift', ';']]
      },
      {
        command: 'baseball',
        shortcut: [['shift', '.']]
      }
    ]
  }
]

const store = configureStore({})
storiesOf('menus/Linear Menu/Bar', module)
  .addDecorator(story => <Provider store={store}>{story()}</Provider>)
  .add('two menus', () => (
    <LinearMenuBar
      menus={[
        {
          title: 'Animals',
          items: [
            { command: 'dog', shortcuts: [['control', 'option', 'd']] },
            { command: 'cat', shortcuts: [['control', 'c']] },
            { command: 'pig', shortcuts: [['control', 'p']] },
            { command: 'bird', shortcuts: [['control', 'b']] }
          ]
        },
        {
          title: 'Fruits',
          items: [
            { command: 'pineapple', shortcuts: [['control', 'command', 'p']] },
            { command: 'apple', shortcuts: [['command', 'shift', 'k']] },
            { command: 'kiwi', shortcuts: [['option', 'k']] },
            { command: 'potato', shortcuts: [['control', 'shift', 'p']] }
          ]
        }
      ]}
      onResponse={action('Command')}
    />
  ))
// .add("submenus", () => <LinearMenuBar menuItems={[]} />);

storiesOf('menus/Linear Menu/Menu', module)
  .add('closed', () => (
    <LinearMenu
      title='Animals'
      menuItems={[
        { command: 'dog', shortcuts: [['control', 'd']] },
        { command: 'cat', shortcuts: [['control', 'c']] },
        { command: 'pig', shortcuts: [['control', 'p']] },
        { command: 'bird', shortcuts: [['control', 'b']] }
      ]}
      onClick={action('clicked')}
      onMouseEnter={action('onMouseEnter')}
    />
  ))
  .add('open', () => (
    <LinearMenu
      title='Animals'
      menuItems={[
        { command: 'dog', shortcuts: [['control', 'd']] },
        { command: 'cat', shortcuts: [['control', 'c']] },
        { command: 'pig', shortcuts: [['control', 'p']] },
        { command: 'bird', shortcuts: [['control', 'b']] }
      ]}
      open
      onClick={action('clicked')}
      onMouseEnter={action('onMouseEnter')}
    />
  ))
// .add("submenus", () => (
//   <LinearMenu
//     name="Animals"
//     menuItems={[
//       "dog",
//       "cat",
//       "pig",
//       { Birds: shortcuts : ["falcon", "platypus", "hawk", "raven"] }
//     ]}
//   />
// ));
let menus = [
  {
    title: 'Animals',
    items: [
      { command: 'dog', shortcuts: [['control', 'option', 'd']] },
      { command: 'cat', shortcuts: [['control', 'c']] },
      { command: 'pig', shortcuts: [['control', 'p']] },
      { command: 'bird', shortcuts: [['control', 'b']] }
    ]
  },
  {
    title: 'Fruits',
    items: [
      { command: 'pineapple', shortcuts: [['control', 'command', 'p']] },
      { command: 'apple', shortcuts: [['command', 'shift', 'k']] },
      { command: 'kiwi', shortcuts: [['option', 'k']] },
      { command: 'potato', shortcuts: [['control', 'shift', 'p']] }
    ]
  }
]

storiesOf('menus/ExposeHK', module)
  .addDecorator(story => <Provider store={store}>{story()}</Provider>)
  .addDecorator(withKnobs)
  .add('500ms', () => (
    <ExposeHK
      commandHierarchy={all_hierarchies}
      menus={menus}
      delay={500}
      onClick={action('clicked')}
      onMouseEnter={action('onMouseEnter')}
    />
  ))
  .add('none', () => (
    <ExposeHK
      commandHierarchy={all_hierarchies}
      menus={menus}
      onClick={action('clicked')}
      onMouseEnter={action('onMouseEnter')}
    />
  ))
  .add('knob', () => (
    <ExposeHK
      commandHierarchy={all_hierarchies}
      menus={menus}
      delay={number('Delay', 500)}
      onClick={action('clicked')}
      onMouseEnter={action('onMouseEnter')}
    />
  ))
  .add('test', () => (
    <ExposeHK
      commandHierarchy={menuToCommandHierarchy(testMenu)}
      menus={testMenu}
      onClick={action('clicked')}
      onMouseEnter={action('onMouseEnter')}
    />
  ))
