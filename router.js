'use strict';

const usersController = require('./controllers/usersController');
const eventsController = require('./controllers/eventsController');
const ratingController = require('./controllers/ratingController');
const restaurntsController = require('./controllers/restaurntsController');

const router = require('koa-router')();

const authorize = async (ctx, next) => {
  if (!ctx.user) {
    ctx.status = 401;
    return;
  }

  await next();
};

const routes = function (app) {
  router
    .post('/api/v1/auth', usersController.auth)
    .get('/api/v1/user/:id', authorize, usersController.getUser)
    .put('/api/v1/user/:id', authorize, usersController.rating)
    .get('/api/v1/me', authorize, usersController.me)
    .put('/api/v1/me', authorize, usersController.edit)

    .post('/api/v1/event', authorize, eventsController.createEvent)
    .put('/api/v1/event/:id', authorize, eventsController.editEvent)
    .delete('/api/v1/event/:id', authorize, eventsController.deleteEvent)
    .get('/api/v1/event/:id', authorize, eventsController.getEvent)
    .post('/api/v1/event/:id/join', authorize, eventsController.joinEvent)
    .post('/api/v1/event/:id/leave', authorize, eventsController.leaveEvent)
    .get('/api/v1/events/:latlng/:from/:to', authorize, eventsController.getEvents)

    .options('/', options)
    .trace('/', trace)
    .head('/', head);

  app
    .use(router.routes())
    .use(router.allowedMethods());

  return app;
};


const head = async () => {
  return;
};

const options = async () => {
  this.body = 'Allow: HEAD,GET,PUT,DELETE,OPTIONS';
};

const trace = async () => {
  this.body = 'Smart! But you can\'t trace.';
};

module.exports = routes;
