import {
  mergeCommandHierarchy,
  menuToCommandHierarchy
} from './CommandHierarchies'

import deepFreeze from 'deep-freeze'

describe('mergeCommandHierarchy', () => {
  it('merges command hierarchies', () => {
    const H1 = {
      meta: {
        s: {
          command: 'quit application'
        }
      },
      'shift+meta': {
        r: {
          command: 'quit'
        }
      }
    }

    const H2 = {
      meta: {
        q: {
          command: 'quit application'
        }
      },
      'meta+shift': {
        t: {
          command: 'quit application'
        }
      }
    }

    const H12 = {
      meta: {
        s: {
          command: 'quit application'
        },
        q: {
          command: 'quit application'
        }
      },
      'shift+meta': {
        r: {
          command: 'quit'
        },
        t: {
          command: 'quit application'
        }
      }
    }

    expect(mergeCommandHierarchy(H1, H2)).toEqual(H12)
  })

  it('handles unsorted modifiers', () => {
    const H1 = {
      'shift+meta': {
        r: {
          command: 'quit'
        }
      }
    }

    const H2 = {
      'meta+shift': {
        s: {
          command: 'quit application'
        }
      }
    }

    const H12 = {
      'shift+meta': {
        r: {
          command: 'quit'
        },
        s: {
          command: 'quit application'
        }
      }
    }

    expect(mergeCommandHierarchy(H1, H2)).toEqual(H12)
  })

  it('left overrides right', () => {
    const H1 = {
      shift: {
        s: {
          command: 'left'
        }
      }
    }

    const H2 = {
      shift: {
        s: {
          command: 'quit application'
        }
      }
    }

    const H12 = {
      shift: {
        s: {
          command: 'left'
        }
      }
    }

    expect(mergeCommandHierarchy(H1, H2)).toEqual(H12)
  })

  xit('adds level information', () => {
    const H1 = {
      meta: {
        s: {
          command: 'quit application'
        }
      }
    }

    const H2 = {
      meta: {
        q: {
          command: 'quit'
        }
      }
    }

    const H12 = {
      meta: {
        s: {
          command: 'quit application'
        },
        q: {
          command: 'quit',
          level: 'level'
        }
      }
    }
    expect(mergeCommandHierarchy(H1, H2, 'level')).toEqual(H12)
  })

  it('handles submenus', () => {
    const H1 = {
      meta: {
        s: {
          meta: {
            f: {
              command: 'quit'
            }
          }
        }
      }
    }

    const H2 = {
      meta: {
        s: {
          meta: {
            g: {
              command: 'quit application'
            }
          }
        }
      }
    }

    const H12 = {
      meta: {
        s: {
          meta: {
            g: {
              command: 'quit application'
            },
            f: {
              command: 'quit'
            }
          }
        }
      }
    }
    expect(mergeCommandHierarchy(H1, H2, 'level')).toEqual(H12)
  })

  it('doesnt change the left side', () => {
    const H1 = {
      meta: {
        s: {
          meta: {
            f: {
              command: 'quit'
            }
          }
        }
      }
    }

    const H2 = {
      meta: {
        s: {
          meta: {
            g: {
              command: 'quit application'
            }
          }
        }
      }
    }

    deepFreeze(H2)

    const H2copy = JSON.parse(JSON.stringify(H2))

    mergeCommandHierarchy(H1, H2)

    expect(H2).toEqual(H2copy)
  })
})

it('converts menus to command hierarchies', () => {
  const menus = [
    {
      title: 'animals',
      items: [
        { command: 'dog', shortcut: [['control', 'meta', 'd']] },
        { command: 'cat', shortcut: [['control', 'meta', 'c']] },
        {
          command: 'kitty',
          shortcut: [['control', 'meta', 'f'], ['control', 'meta', 'g']]
        }
      ]
    },
    {
      title: 'Fruits',
      items: [{ command: 'carrot', shortcut: [['control', 'c']] }]
    }
  ]

  const commandHierarchy = {
    control: {
      c: { command: 'carrot', title: 'Fruits' }
    },
    'control+meta': {
      d: {
        command: 'dog',
        title: 'animals'
      },
      c: { command: 'cat', title: 'animals' },
      f: { 'control+meta': { g: { command: 'kitty', title: 'animals' } } }
    }
  }

  expect(menuToCommandHierarchy(menus)).toEqual(commandHierarchy)
})
