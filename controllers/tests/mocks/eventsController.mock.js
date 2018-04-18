// Mock context
const ctx = {
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
      place_url: 'http://www.facebook.com',
      location: {
        type: 'Point',
        coordinates: [40.741895, -73.989308]
      },
      when: '3232',
      _id: '6464',
      attendees: ['6464']
    }
  }
};

// Mock contextctx.rectx.request.query.latquest.query.lat
const emptyDataCtx = {
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
const emptyLocationCtx = {
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
      dist: ''
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
const wrongTypeLocationCtx = {
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
      dist: ''
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

module.exports = {
  ctx,
  emptyDataCtx,
  emptyLocationCtx,
  wrongTypeLocationCtx
};
