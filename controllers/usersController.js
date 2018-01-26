'use strict';
const monk = require('monk');
const axios = require('axios');
const db = monk('localhost/wallto_db');
const config = require('../config.js');
const filterProps = require('../services/utils').filterProps;

const User = db.get('users');

const userDB = async (userData) => {
  // console.log('userDB:', userData);
  let user = await User.findOne({email: userData.email});
  // console.log('findOne:', user);
  if (!user) {
    try {
      // console.log('new user');
      return User.insert(userData);
    } catch (e) { console.error('User.insert', e); }
  } else {
    try {
      await User.update({email: userData.email}, {
        'name': userData.name, 
        'email': userData.email, 
        'accessToken': userData.accessToken, 
        'profile_picture': userData.profile_picture
      });
      // console.log('update user');
      return User.findOne({email: userData.email});
    } catch(e) { console.error('Update user error', e); }
  }
}

module.exports.auth = async (ctx, next) => {
  if ('POST' != ctx.method) return await next();
  if (ctx.request.body.network == 'facebook') {
    try {
      let authResult = await axios.get(config.facebook.validateUrl+config.facebook.fields, {
        headers: {
          'Authorization': 'Bearer ' + ctx.request.body.accessToken,
        }
      });
      console.log('authResult', authResult);
      if (authResult.id == ctx.request.body.id) {
        let user = {
          'name': authResult.name,
          'email': authResult.email,
          'profile_picture': authResult.picture.data.url,
          'birthday':authResult.birthday,
          'gender': authResult.gender,
          'accessToken': 'FB' + ctx.request.body.accessToken,
        };
        user = await userDB(user);
        console.log('user', user);
        if (user.email) {
          ctx.status = 200;
          ctx.body = JSON.stringify({'user': user});
          return;
        }
      }
    } catch(e) { console.error('Facebook validate error'); }
  } else if (ctx.request.body.network == 'google') {
    // console.log('google ctx.request.body', ctx.request.body);
    try {
      let authResult = await axios.get(config.google.validateUrl + ctx.request.body.idToken, {
        headers: {
          'Authorization': 'Bearer ' + ctx.request.body.accessToken,
        }
      });
      console.log('authResult', authResult.data);
      if (authResult.data.sub == ctx.request.body.id) {
        let user = {
          'name': authResult.data.name,
          'email': authResult.data.email,
          'profile_picture': authResult.data.picture,
          'birthday':authResult.data.birthday,
          'gender': authResult.data.gender,
          'accessToken': 'GO' + ctx.request.body.accessToken,
        };
        user = await userDB(user);
        console.log('user', user);
        if (user.email) {
          ctx.status = 200;
          ctx.body = JSON.stringify({'user': user});
          return;
        }
      }
    } catch(e) { console.error('Google validate error'); }
  } if (ctx.request.body.network == 'linkedin') {
    console.log('linkedin ctx.request.body', ctx.request.body);
  }
  ctx.status = 404;
};

module.exports.getUser = async (ctx, next) => {
  if ('GET' != ctx.method) return await next();
  try {
    user = await User.findOne({_id: ctx.params.id});
    user = filterProps(user, ['_id', 'name', 'profile_picture', 'gender', 'age']);
  } catch(e) { console.error('Get user error', e); }
  ctx.status = 200;
  ctx.body = user;
};

module.exports.rating = async (ctx, next) => {
  if ('PUT' != ctx.method) return await next();
  let rating = ctx.request.body.rating;
  let user_to_rate = ctx.params.id;
  try {
    await User.update({_id: user_to_rate},
      {
        'rating': {
          'user_id': userData.email, 
          'value': userData.accessToken, 
          'profile_picture': userData.profile_picture
        },
        
      });
  } catch(e) { console.error('Rating user error', e); }
  ctx.status = 200;
  ctx.body = promise;
};

module.exports.me = async (ctx, next) => {
  if ('GET' != ctx.method) return await next();
  ctx.status = 200;
  ctx.body = ctx.user;
};

module.exports.edit = async (ctx, next) => {
  if ('PUT' != ctx.method) return await next();
  try {
    await User.update({_id: ctx.user._id}, ctx.request.body.edit);
    // the recived object should be like this:
    // ctx.request.body.edit =
    // {
    //   'preferences': [tennis , video games, food],
    //   'description': 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.'
    // }
    return User.findOne({_id: ctx.user._id});
  } catch(e) { console.error('Edit user error', e); }
  ctx.status = 200;
  ctx.body = ctx.user;
};
