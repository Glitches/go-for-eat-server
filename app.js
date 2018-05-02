'use strict';
require('dotenv').config();
const koa = require('koa');
const helmet = require('koa-helmet');
const logger = require('koa-logger');
const cors = require('kcors');
const bodyParser = require('koa-bodyparser');
const compress = require('koa-compress');
const monk = require('monk');
const app = (module.exports = new koa());
const routes = require('./router.js');
const db = monk(process.env.MONGOLAB_URI);
//eslint-disable-next-line
db.then(()=> {console.log('Connected correctly to server')})

const User = db.get('users');
const Restaurant = db.get('restaurants');
const Raven = require('raven');


process.env.ENV === 'production' &&
  Raven.config(process.env.SENTRY_DSN).install();

// Logger
app
  .use(logger())
  .use(helmet())
  .use(cors())
  .use(bodyParser())
  // error handling
  .use(async (ctx, next) => {
    try {
      await next();
    } catch (err) {
      ctx.body = undefined;
      switch (ctx.status) {
      case 401:
        ctx.app.emit('error', err, this);
        break;
      case 400:
        ctx.app.emit('Resource error', err, this);
        break;
      case 404:
        ctx.app.emit('Resource not found', err, this);
        break;
      default:
        if (err.message) {
          ctx.body = { errors: [err.message] };
        }
        ctx.app.emit('error', err, this);
      }
    }
  });

routes(app);

// Compress
app.use(compress());

// Raven
app.on('error', async err => {
  console.error(err);

  process.env.ENV === 'production' &&
    await Raven.captureException(err, (err, eventId) => {
      //eslint-disable-next-line
      console.log(`Reported error ${eventId}`);
    });
});

module.exports = app;
