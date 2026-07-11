# RubberDock

A lightweight, draggable, resizable docking layout system for React. Inspired by GoldenLayout.

**[Live demo](https://ihatemundays.github.io/RubberDock/)**

## Features

* Resizable rows and columns, nested arbitrarily deep
* Tabbed stacks, horizontal or vertical, toggleable at runtime
* Drag and drop everywhere: reorder tabs within a group, move a tab into another group, or drag one out to split a panel in two
* Pop an item out into its own real browser window, and dock it back
* Fullscreen/maximize a single item
* Per-item control over which actions are available (fullscreen, pop out, maximize, close)
* ARIA-compliant tablist keyboard navigation (arrow keys, Home/End)
* No dependencies beyond React and Font Awesome (for icons)

## Installation

```
npm install rubber-dock
```

`react` and `react-dom` (^19) are peer dependencies.

## Quick start

```tsx
import { Layout, Row, Column, Stack, Item } from 'rubber-dock';
import 'rubber-dock/styles.css';

const App = () => (
  <Layout>
    <Row>
      <Item tab="Welcome">
        <div>Hello, RubberDock!</div>
      </Item>
      <Stack>
        <Item tab="Tab A">Content A</Item>
        <Item tab="Tab B">Content B</Item>
      </Stack>
    </Row>
  </Layout>
);
```

Importing from `rubber-dock` already pulls in its stylesheet as a side effect, so the explicit `rubber-dock/styles.css` import above is only needed if your bundler strips CSS side effects (e.g. some SSR setups).

## Topology

```
Layout
└── Row / Column (nest freely)
    └── Stack (a tab group; a bare Item is auto-wrapped in one)
        └── Item
            └── your content
```

* **Layout** - the root. Owns one dock's worth of state; use multiple `<Layout>`s to keep separate docks isolated.
* **Row** / **Column** - lay their children out horizontally/vertically, with a draggable resizer between each pair.
* **Stack** - a group of tabs. Drag a tab's edge to the edge of the stack's own body to split it into a new Row/Column.
  * `vertical` (`boolean`, default `false`) - render tabs down the side instead of across the top. Toggleable at runtime via the icon in the tab bar.
* **Item** - a single dockable pane.
  * `tab` (`string | ReactNode`) - the tab's label/content.
  * `hasFullscreen`, `hasPopOut`, `hasMaximize`, `hasClose` (`boolean`, default `true`) - show/hide that action on the tab.

A function-component `Item` child receives `id`, `isFullscreen`, and `toggleItemFullscreen` as props, so tab content can read and drive the pane hosting it.

## Development

```
npm run dev          # sandbox app at public/, used to develop the library
npm run build         # build the library to dist/
npm run build:demo    # build the public/ sandbox as a static site (used for the GitHub Pages demo)
npm run typecheck
```

## License

ISC - see [LICENSE](./LICENSE).
