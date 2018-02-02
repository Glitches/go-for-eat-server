'use strict';
const app = require('./app');

if (!module.parent) {
  const port = process.env.PORT || 3006;
  app.listen(port);
  // eslint-disable-next-line
  console.log('Listening to %s', port);
}