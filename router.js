'use strict';
const router = require('koa-router')();

const UsersController = require('./controllers/usersController');
const EventsController = require('./controllers/eventsController');
const RatingsController = require('./controllers/ratingsController');
const RestaurantsController = require('./controllers/restaurantsController');
const MeetingsController = require('./controllers/meetingsController');

// MongoDb configure
const monk = require('monk');
const db = monk(process.env.MONGOLAB_URI);

// Creating Db instances
const Event = db.get('events');
const User = db.get('users');
const Rating = db.get('ratings');
const Restaurant = db.get('restaurants');
const Meeting = db.get('meetings');

// Geo Indexing for MongoDb
Event.createIndex({ location: '2dsphere' });

const eventsController = new EventsController(Event);
const ratingsController = new RatingsController(Rating, User);
// monk here is mandatory!
const usersController = new UsersController(User, Event, monk, Rating);

const restaurantsController = new RestaurantsController(Restaurant);
const meetingsController = new MeetingsController(Meeting);

const authorize = async (ctx, next) => {
  let authorization = ctx.headers.authorization;

  if (!authorization || authorization.split(' ')[0] != 'Bearer') {
    ctx.status = 401;
    return;
  }
  ctx.token = authorization.split(' ')[1];

  let Resource = User;
  if (ctx.token.startsWith('--r--')) Resource = Restaurant;

  ctx.user = await Resource.findOne({ accessToken: ctx.token });

  if (!ctx.user) {
    ctx.status = 401;
    return;
  }

  await next();
};

const routes = function (app) {
  router
    // Authorization
    .post('/api/v1/auth', usersController.auth.bind(usersController))
    // Get users info
    .get(
      '/api/v1/users/:id',
      authorize,
      usersController.getUser.bind(usersController)
    )
    // Get my info
    .get('/api/v1/me', authorize, usersController.me.bind(usersController))
    // Modify my info
    .put(
      '/api/v1/me',
      authorize,
      usersController.editUser.bind(usersController)
    )
    // Rate user
    .put(
      '/api/v1/users/:id/rating',
      authorize,
      ratingsController.rateUser.bind(ratingsController)
    )
    .post(
      '/api/v1/events',
      authorize,
      eventsController.createEvent.bind(eventsController)
    )
    .put(
      '/api/v1/events/:id',
      authorize,
      eventsController.editEvent.bind(eventsController)
    )
    .delete(
      '/api/v1/events/:id',
      authorize,
      eventsController.deleteEvent.bind(eventsController)
    )
    .get(
      '/api/v1/events/:id',
      authorize,
      eventsController.getEvent.bind(eventsController)
    )
    .put(
      '/api/v1/events/:id/users',
      authorize,
      eventsController.joinEvent.bind(eventsController)
    )
    .delete(
      '/api/v1/events/:id/users',
      authorize,
      eventsController.leaveEvent.bind(eventsController)
    )
    .get(
      '/api/v1/events',
      authorize,
      eventsController.getEvents.bind(eventsController)
    )

    .post(
      '/restaurant',
      restaurantsController.createRestaurant.bind(restaurantsController)
    )

    //PREGUNTAR A AROL POR ESTO @@@@@@@@@@@@@#################
    .get(
      '/restaurant/sign-in',
      restaurantsController.signIn.bind(restaurantsController)
    )

    .get(
      '/restaurant/me',
      authorize,
      restaurantsController.me.bind(restaurantsController)
    )

    .post(
      '/restaurant/createEvents',
      authorize,
      meetingsController.createMeeting.bind(meetingsController)
    )

    .put(
      '/restaurants/events/:event_id',
      authorize,
      meetingsController.editMeeting.bind(meetingsController),
    )

    .options('/', options)
    .trace('/', trace)
    .head('/', head);

  app.use(router.routes()).use(router.allowedMethods());

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
