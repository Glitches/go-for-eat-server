// Mock context
const singleFieldCtx = {
  params: {
    id: ''
  },
  method: '',
  status: 0,
  user: {
    _id: 'blabla'
  },
  request: {
    body: {
      edit: {
        interests: ['tennis', 'f1']
      }
    }
  }
};

const tooManyCtx = {
  params: {
    id: ''
  },
  method: '',
  status: 0,
  user: {
    _id: 'blabla'
  },
  request: {
    body: {
      edit: {
        interests: [
          'tennis',
          'f1',
          '34',
          'dog',
          'sea',
          'google',
          'facebook',
          'ferrari'
        ],
        description:
          'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut lobortis quam in felis scelerisque rhoncus. Integer sed leo nec justo vestibulum consectetur id a justo. Quisque ultricies tellus posuere nulla feugiat, vel blandit lacus dignissim. Nulla sit amet nisi augue. Aenean auctor odio porttitor, auctor leo ut, pretium dui. Suspendisse.',
        profession: 'Full stack developer'
      }
    }
  }
};

module.exports = {
  singleFieldCtx,
  tooManyCtx
};
