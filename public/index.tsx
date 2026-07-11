import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Column, Item, Layout, Row, Stack } from "../src/index";
import './main.scss';

// Item clones function-component children with its own live state (id,
// isFullscreen, toggleItemFullscreen), so a tab body can read and drive the
// pane that hosts it without any extra wiring.
const StatusPanel = ({ id, isFullscreen, toggleItemFullscreen }: any) => (
    <div className="example-status">
        <p>Item id: <code>{id}</code></p>
        <p>Fullscreen: <strong>{isFullscreen ? 'on' : 'off'}</strong></p>
        <button onClick={toggleItemFullscreen}>Toggle fullscreen</button>
    </div>
);

createRoot(document.getElementById('root')!).render(<StrictMode>
    <Layout>
        <Row>
            <Column>
                <Stack>
                    <Item tab={<><i className="fas fa-folder-tree" /> Explorer</>}
                          hasFullscreen={false} hasPopOut={false} hasMaximize={false} hasClose={false}>
                        <ul className="example-file-list">
                            <li><i className="fas fa-file-code" /> index.ts</li>
                            <li><i className="fas fa-file-code" /> App.tsx</li>
                            <li><i className="fas fa-file-code" /> Stack.tsx</li>
                            <li><i className="fas fa-file-code" /> Item.tsx</li>
                            <li><i className="fas fa-file-code" /> main.scss</li>
                            <li><i className="fas fa-file-lines" /> README.md</li>
                        </ul>
                    </Item>
                </Stack>
            </Column>
            <Column>
                <Stack>
                    <Item tab="index.ts">
                        <pre className="example-code">{`import { Layout, Row, Column, Stack, Item } from 'rubber-dock';`}</pre>
                    </Item>
                    <Item tab="App.tsx">
                        <pre className="example-code">{`export const App = () => <Layout>...</Layout>;`}</pre>
                    </Item>
                    <Item tab="Stack.tsx">
                        <pre className="example-code">{`const Stack = props => {\n    // renders a scrollable row/column of tabs\n};`}</pre>
                    </Item>
                    <Item tab="Item.tsx">
                        <pre className="example-code">{`const Item = props => {\n    // a single dockable, poppable, resizable pane\n};`}</pre>
                    </Item>
                    <Item tab="main.scss">
                        <pre className="example-code">{`.rubber-dock__item {\n  background-color: #212121;\n}`}</pre>
                    </Item>
                    <Item tab="README.md">
                        <pre className="example-code">{`# RubberDock\n\nA draggable, resizable docking layout for React.`}</pre>
                    </Item>
                    <Item tab={<><i className="fas fa-vial" /> tests.spec.ts</>}>
                        <pre className="example-code">{`test('docks an item', () => {\n    // ...\n});`}</pre>
                    </Item>
                </Stack>
                <Stack>
                    <Item tab={<><i className="fas fa-terminal" /> Terminal</>}>
                        <pre className="example-code">{`$ npm run build\n> tsup\n\nESM dist/index.js   32.35 KB`}</pre>
                    </Item>
                    <Item tab="Problems">
                        <p>No problems have been detected in the workspace.</p>
                    </Item>
                    <Item tab="Output">
                        <StatusPanel />
                    </Item>
                </Stack>
            </Column>
            <Column>
                <Stack vertical={true}>
                    <Item tab="Outline">
                        <ul className="example-file-list">
                            <li>Layout</li>
                            <li>Row</li>
                            <li>Column</li>
                            <li>Stack</li>
                            <li>Item</li>
                        </ul>
                    </Item>
                    <Item tab="Timeline">
                        <p>No recent activity.</p>
                    </Item>
                </Stack>
            </Column>
        </Row>
    </Layout>
</StrictMode>);
