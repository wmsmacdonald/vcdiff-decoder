# vcdiff-decoder
Pure JavaScript vcdiff decoder that works with binary deltas from Google's open-vcdiff

```javascript
const fs = require('fs');
const vcdiff = require('vcdiff-decoder');

let delta = fs.readFileSync('./some_delta_file');
let target = vcdiff.decodeSync(text, new Buffer('some dictionary string buffer'));
console.log(target.toString());
```
