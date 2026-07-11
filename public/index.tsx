import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import {Column, Item, Layout, Row, Stack} from "../src/index";
import './main.scss';

const Something = ({id}) => {
  return (<div>{id}</div>);
}

createRoot(document.getElementById('root')!).render(<StrictMode>
  <Layout>
    <Row>
      <Item tab="Tab 1">
        <div>here</div>
      </Item>
      <Item tab="Tab 2" state={{foo: 'bar'}}>
        <div>there</div>
      </Item>
      <Stack>
        <Item tab="Tab 3">
          <div>other there</div>
        </Item>
        <Item tab="Tab 3a">
          <div>other there 2</div>
        </Item>
        <Item tab="Tab 3b">
          <div>other there 3</div>
        </Item>
      </Stack>
      <Column>
        <Item tab={<i className={'fab fa-windows'} />}>
          <Something>
          </Something>
        </Item>
        <Stack vertical={true}>
          <Item tab="Tab 5a">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam blandit a leo id porttitor. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Proin dapibus nec risus eu viverra. Praesent pharetra mollis est, molestie fringilla ex pellentesque sit amet. Proin nec lacus at velit vulputate maximus. Nam rutrum, quam sit amet hendrerit luctus, tellus arcu fringilla urna, eget lobortis magna felis sed nibh. Fusce id nunc ac est scelerisque fringilla. Curabitur fringilla justo id odio egestas, vitae egestas lacus pulvinar. Nullam porta turpis in faucibus vulputate.

            Praesent a arcu interdum urna ornare pellentesque rhoncus quis leo. Nunc condimentum felis in lectus euismod ultrices. Pellentesque commodo pellentesque orci. Duis viverra dapibus vestibulum. Maecenas id nulla ac metus scelerisque vehicula ultricies at enim. Fusce sodales, massa ac accumsan pulvinar, elit velit cursus sapien, id auctor tortor nulla eget arcu. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Morbi eu varius lacus. Mauris in diam non turpis ornare condimentum. Nullam in dignissim orci, eu efficitur neque.

            Phasellus eu elit euismod, ultrices diam in, venenatis ante. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Vestibulum elementum metus placerat, condimentum orci vitae, accumsan nisi. Praesent sapien lectus, varius quis felis quis, porttitor varius ex. Sed facilisis pretium nisl at viverra. Interdum et malesuada fames ac ante ipsum primis in faucibus. Pellentesque id placerat eros. Integer finibus nunc non metus imperdiet, a fringilla justo commodo. Vivamus pretium nunc ut purus blandit feugiat. Proin mattis suscipit enim eu ullamcorper. Nullam tincidunt efficitur ante id facilisis. Nullam venenatis nisl nisl, at varius ex elementum eget. Phasellus tristique purus finibus orci sodales vestibulum.

            Mauris vitae nulla sit amet erat convallis consectetur aliquam id nunc. Nam eu iaculis nibh. Quisque justo nibh, viverra finibus bibendum et, fringilla vel tortor. Aliquam erat volutpat. Cras eget finibus nulla, at feugiat nis Maecenas non enim eros. Fusce ultrices iaculis urna, ac interdum ante ornare at. Duis porttitor quis mauris eu tincidunt. Quisque hendrerit ut ex nec suscipit. Ut auctor mattis felis sed tincidunt. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Sed porttitor egestas velit, non sagittis metus facilisis sit amet. Sed interdum tincidunt nibh, ut tincidunt quam pharetra ut. Nullam volutpat eu turpis vel gravida.

            Nullam ac mi et tortor mollis hendrerit non ut neque. Duis pretium lorem tellus, ac imperdiet enim consequat sed. Aenean laoreet lectus ante, at maximus quam semper eu. Phasellus mattis bibendum porta. Interdum et malesuada fames ac ante ipsum primis in faucibus. Sed aliquam vulputate diam vitae volutpat. Mauris aliquam arcu enim, sed vulputate nisi mollis at. Integer eget urna quis neque auctor pharetra in et ante. Duis tempus vitae magna lobortis consectetur. Sed interdum ornare ex ut pellentesque. Nulla eget aliquet erat, eu iaculis turpis.
          </Item>
          <Item tab="Tab 5b">
            small
          </Item>
        </Stack>
        <Item tab={<div>Amazing!</div>}>
          here
        </Item>
      </Column>
    </Row>
  </Layout>
</StrictMode>);
