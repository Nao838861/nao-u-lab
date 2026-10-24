import fs from 'node:fs';
import {makeCore, root} from './pose_lib.mjs';
const {shot} = await makeCore();
const list = [[300, 300, 0], [320, 300, 0], [300, 320, 0], [300, 300, 16], [320, 300, 16], [300, 320, 16]];
fs.writeFileSync(root + '/rec/dir.rgb', Buffer.concat(list.map(([x, y, a]) => shot(x, y, a))));
