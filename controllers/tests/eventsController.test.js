'use strict';

const EventsController = require('../eventsController');

const mockMongoDb = jest.fn;

// from test ////////////////////////////////////////////

// const createdEvent = {}
// const eventController = new EventsController({
//   insert: jest.fn().returnValue(() => createdEvent)
// })

// ctx = {};
// eventController.createEvent(ctx, next);
// ctx.body.toEqual(JSON.stringify({
//   'event': createdEvent
// }))
// ctx.status.toEqual(201);

/////////////////////////////////////////////////////////

// Mock context
let ctx = {
  params: {
    id: ''
  },
  method: '',
  status: 0,
  user: {
    _id: 'blabla'
  },
  request: {
    query: {
      lat: '42',
      lng: '42'
    },
    body: {
      place_id: 'aasdf',
      place_name: 'asdf',
      place_address: 'asdf',
      location: {
        lat: 40.741895,
        lng: -73.989308,
      },
      when: '3232',
      _id: '6464',
      attendees: []
    }
  }
};

// Mock context
let emptyDataCtx = {
  params: {
    id: ''
  },
  method: '',
  status: 0,
  user: '',
  request: {
    query: {
      lat: '42',
      lng: '42'
    },
    body: {
      place_id: '',
      place_name: '',
      place_address: '',
      location: '',
      when: '',
      _id: '',
      attendees: []
    }
  }
};

// Mock context empty location fields
let emptyLocationCtx = {
  params: {
    id: ''
  },
  method: '',
  status: 0,
  user: {
    _id: 'blabla'
  },
  request: {
    query: {
      lat: '',
      lng: '',
      dist:''
    },
    body: {
      place_id: 'aasdf',
      place_name: 'asdf',
      place_address: 'asdf',
      location: '6565',
      when: '3232',
      _id: '6464',
      attendees: []
    }
  }
};

// Mock context empty location fields
let wrongTypeLocationCtx = {
  params: {
    id: ''
  },
  method: '',
  status: 0,
  user: {
    _id: 'blabla'
  },
  request: {
    query: {
      lat: '1fwwe3',
      lng: '4gtg',
      dist:''
    },
    body: {
      place_id: 'aasdf',
      place_name: 'asdf',
      place_address: 'asdf',
      location: '6565',
      when: '3232',
      _id: '6464',
      attendees: []
    }
  }
};


const next = () => {};
const createdEvent = {
  attendees: ['42']
};

const mockEventsMongoInstance = {
  insert: mockMongoDb(() => createdEvent),
  update: mockMongoDb(() => createdEvent),
  remove: mockMongoDb(() => createdEvent),
  findOne: mockMongoDb(() => createdEvent),
  aggregate: mockMongoDb(() => createdEvent)
};

const mockMonkInstance = {
  id: mockMongoDb(() => createdEvent)
};
const eventController = new EventsController(mockEventsMongoInstance, mockMonkInstance);

describe('Test correct response on events functions calls', () => {
  
  test('Return 201 on create event', async () => {
    ctx.method = 'POST';
    await eventController.createEvent(ctx, next);
    expect(ctx.body).toEqual(JSON.stringify({
      'event': createdEvent
    }));
    expect(ctx.status).toEqual(201);

  });
  
  test('Return 400 on createEvent with empty fields', async () => {
    emptyDataCtx.method = 'POST';
    await eventController.createEvent(emptyDataCtx, next);
    expect(emptyDataCtx.status).toEqual(400);
  });

  test('Return 400 on createEvent with wrong location entry fields', async () => {
    emptyLocationCtx.method = 'POST';
    await eventController.createEvent(emptyLocationCtx, next);
    expect(emptyLocationCtx.status).toEqual(400);
  });

  test('Return 204 on edit an event', async () => {
    ctx.method = 'PUT';
    await eventController.editEvent(ctx, next);
    expect(ctx.status).toEqual(204);
  });

  test('Return 400 on editEvent with empty fields', async () => {
    emptyDataCtx.method = 'PUT';
    await eventController.editEvent(emptyDataCtx, next);
    expect(emptyDataCtx.status).toEqual(400);
  });

  test('Return 400 on editEvent with wrong location entry fields', async () => {
    emptyLocationCtx.method = 'POST';
    await eventController.editEvent(emptyLocationCtx, next);
    expect(emptyLocationCtx.status).toEqual(400);
  });


  test('Return 204 on deleting an event', async () => {
    ctx.method = 'DELETE';
    await eventController.deleteEvent(ctx, next);
    expect(ctx.status).toEqual(204);
  });  

  test('Return 200 on getting infos of an event', async () => {
    ctx.method = 'GET';
    await eventController.getEvent(ctx, next);
    expect(ctx.status).toEqual(200);
  });

  test('Return 204 on joining an event', async () => {
    ctx.method = 'PUT';
    await eventController.joinEvent(ctx, next);
    expect(ctx.status).toEqual(204);
  });

  test('Return 200 on leaving an event', async () => {
    ctx.method = 'DELETE';
    await eventController.leaveEvent(ctx, next);
    expect(ctx.body).toEqual(JSON.stringify({
      'event': createdEvent
    }));
    expect(ctx.status).toEqual(200);
  });

  test('Return 200 on getting all events nearby list', async () => {
    ctx.method = 'GET';
    await eventController.getEvents(ctx, next);
    expect(ctx.body).toEqual(JSON.stringify(createdEvent));
    expect(ctx.status).toEqual(200);
  });

});


// Testing stuff - when Id has no matches on the database

const WriteResult = {
  nMatched: 0
};

const nullResult = null;

const mockEmptyMongoInstance = {
  insert: mockMongoDb(() => createdEvent),
  update: mockMongoDb(() => WriteResult),
  remove: mockMongoDb(() => createdEvent),
  findOne: mockMongoDb(() => nullResult),
  aggregate: mockMongoDb(() => createdEvent)
};


const eventControllerNoMatches = new EventsController(mockEmptyMongoInstance, mockMonkInstance);


describe('Test on event not found or wrong ID', () => {

  test('editEvent returns error 400 if query has no matches', async () => {
    ctx.method = 'PUT';
    await eventControllerNoMatches.editEvent(ctx, next);
    expect(ctx.status).toEqual(400);
  });

  test('deleteEvent returns error 400 if query has no matches', async () => {
    ctx.method = 'DELETE';
    await eventControllerNoMatches.editEvent(ctx, next);
    expect(ctx.status).toEqual(400);
  });

  test('joinEvent returns error 400 if query has no matches', async () => {
    ctx.method = 'DELETE';
    await eventControllerNoMatches.joinEvent(ctx, next);
    expect(ctx.status).toEqual(400);
  });

  test('leaveEvent returns error 400 if query has no matches', async () => {
    ctx.method = 'DELETE';
    await eventControllerNoMatches.joinEvent(ctx, next);
    expect(ctx.status).toEqual(400);
  });

});


// TODO: verify query params if they from and to are empty, what params do i get?
describe('Test getEvents on wrong url params', () => {
  test('getEvents returns error 400 if url has no position params', async () => {
    emptyLocationCtx.method = 'GET';
    emptyLocationCtx.status = 0;
    await eventControllerNoMatches.getEvents(emptyLocationCtx, next);
    expect(emptyLocationCtx.status).toEqual(400);
  });

  test('getEvents returns error 400 if url has wrong type position params', async () => {
    wrongTypeLocationCtx.method = 'GET';
    wrongTypeLocationCtx.status = 0;
    await eventControllerNoMatches.getEvents(wrongTypeLocationCtx, next);
    expect(wrongTypeLocationCtx.status).toEqual(400);
  });

  test('editEvent returns error 400 if request body has wrong type position params', async () => {
    wrongTypeLocationCtx.method = 'PUT';
    wrongTypeLocationCtx.status = 0;
    await eventControllerNoMatches.editEvent(wrongTypeLocationCtx, next);
    expect(wrongTypeLocationCtx.status).toEqual(400);
  });

});


// + check all aspect of modify event 
// come posso vedere se la funzione mock database vede i dati esatti?