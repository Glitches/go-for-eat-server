'use strict';

const EventsController = require('../eventsController');
const UsersController = require('../usersController');

const { singleFieldCtx, tooManyCtx } = require('./mocks/usersContrller.mock');

const mockMongoDb = jest.fn;

const next = () => {};
const createdUser = {
  interests: ['42'],
  description: '',
  profession: ''
};

const mockEventsMongoInstance = {
  insert: mockMongoDb(() => createdEvent),
  update: mockMongoDb(() => createdEvent),
  remove: mockMongoDb(() => createdEvent),
  findOne: mockMongoDb(() => createdEvent),
  aggregate: mockMongoDb(() => createdEvent)
};

const mockUsersMongoInstance = {
  insert: mockMongoDb(() => createdUser),
  update: mockMongoDb(() => WriteResultOk),
  remove: mockMongoDb(() => createdUser),
  findOne: mockMongoDb(() => nullResult),
  aggregate: mockMongoDb(() => createdUser)
};
const mockUsersMongoEmptyInstance = {
  insert: mockMongoDb(() => createdUser),
  update: mockMongoDb(() => WriteResultEmpty),
  remove: mockMongoDb(() => createdUser),
  findOne: mockMongoDb(() => nullResult),
  aggregate: mockMongoDb(() => createdUser)
};

const WriteResultEmpty = {
  nMatched: 0
};

const WriteResultOk = {
  nMatched: 1
};

const nullResult = null;

const mockMonkInstance = {
  id: mockMongoDb(() => createdUser)
};
const userController = new UsersController(
  mockUsersMongoInstance,
  mockEventsMongoInstance,
  mockMonkInstance
);
const userControllerEmpty = new UsersController(
  mockUsersMongoEmptyInstance,
  mockEventsMongoInstance,
  mockMonkInstance
);

describe('Test correct response on users functions calls', () => {
  test('Return 204 on edit user', async () => {
    singleFieldCtx.method = 'PUT';
    await userController.editUser(singleFieldCtx, next);
    expect(singleFieldCtx.status).toEqual(204);
  });

  test('Return 204 and save 140 chars only', async () => {
    singleFieldCtx.method = 'PUT';
    await userController.editUser(singleFieldCtx, next);
    expect(
      singleFieldCtx.request.body.edit.interests.length
    ).toBeLessThanOrEqual(140);
    expect(singleFieldCtx.status).toEqual(204);
  });

  // test.only('Return 204 and save 140 charactesr long description only', async () => {
  //   tooManyCtx.method = 'PUT';
  //   await userController.editUser(tooManyCtx, next);
  //   expect(tooManyCtx.request.body.edit.description.length).toBeLessThanOrEqual(
  //     140
  //   );
  //   expect(tooManyCtx.status).toEqual(204);
  // });

  test('Return 204 and save 140 charactesr long profession description only', async () => {
    tooManyCtx.method = 'PUT';
    await userController.editUser(tooManyCtx, next);
    expect(tooManyCtx.request.body.edit.profession.length).toBeLessThanOrEqual(
      140
    );
    expect(tooManyCtx.status).toEqual(204);
  });

  test('editEvent returns error 404 if ID has no matches', async () => {
    singleFieldCtx.method = 'PUT';
    await userControllerEmpty.editUser(singleFieldCtx, next);
    expect(singleFieldCtx.status).toEqual(404);
  });
});
