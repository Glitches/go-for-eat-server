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
db.then(()=> {console.log('Connected correctly to server')})

const User = db.get('users');
const Restaurant = db.get('restaurants');
const Raven = require('raven');
const bcrypt = require('bcrypt');
const base64 = require('base-64');

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
  })
  //authentication middleware
  .use(async (ctx, next) => {
    // console.log('authorization accessToken', ctx.token);
    // console.log('context', ctx);
    let authorization = ctx.headers.authorization;
    console.log('HERES AUTHORIZATION', authorization);

    if ((authorization) && authorization.split(' ')[0] === 'Basic') {
      console.log('INSIDE REST AUTH');

      ctx.pass64 = authorization.split(' ')[1];
      console.log('PASS64', ctx.pass64);

      const pass = base64.decode(ctx.pass64).split(':')[1];
      console.log('pass,decrypted',pass);

      const email = base64.decode(ctx.pass64).split(':')[0];
      console.log('user decrypted',email);

      const target = await Restaurant.findOne({ email });
      console.log('TARGET PASS',target.hashed);

      bcrypt.compare(pass, target.hashed, (err, res) => {
        console.log('res is ', res);

        if (res) {
          return ctx.user = target;

        }
        return;
      });
      console.log(ctx.user)
      return await next();
    }

    if (!authorization || authorization.split(' ')[0] != 'Bearer')
      return await next();
    ctx.token = authorization.split(' ')[1];
    ctx.user = await User.findOne({ accessToken: ctx.token });
    return await next();
  });

routes(app);

// Compress
app.use(compress());

// Raven
app.on('error', async err => {
  console.error(err);
  await Raven.captureException(err, (err, eventId) => {


    //eslint-disable-next-line no-console
    console.log(`Reported error ${eventId}`);
  });
});

module.exports = app;
