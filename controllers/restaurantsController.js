'use strict';

const Raven = require('raven');
const bcrypt = require('bcrypt');
const uuid = require('uuid/v4');
const base64 = require('base-64');

// let restaurant = {
//   name: '',
//   email: '',
//   // profile_picture: '',
//   seats: '',
//   owner:'',
//   address: '',
//   accessToken: ''
// };

class RestaurantsController {
  constructor (Restaurants) {
    this.Restaurants = Restaurants;
  }

  async createRestaurant (ctx, next) {
    if (ctx.method !== 'POST') return await next();

    let { email , password } = ctx.request.body;

    if (!email || !password) {
      ctx.status = 400;
      ctx.body = 'Please complete all fields';
      return;
    }

    try {
      const emailCheck = await this.Restaurants.findOne({email});
      if (emailCheck) {
        ctx.status = 400;
        ctx.body = 'User already exists \nPlease choose another email';
        return;
      }
    } catch (e) {
      Raven.captureException(e);
      cts.status = 500;
    }

    //password encryption

    const hashed = bcrypt.hashSync(password, 10);

    const newRestaurant = {
      email,
      hashed,
      timestamp: Date.now(),
      accessToken: '--r--' + uuid(),
    };

    const restaurant = await this.Restaurants.insert(newRestaurant);

    ctx.status = 201;
    ctx.body = {
      id: restaurant._id,
      email: restaurant.email,
      accessToken: restaurant.accessToken
    } ;
  }

  async signIn (ctx) {
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

      const target = await this.Restaurants.findOne({ email });
      console.log('TARGET PASS',target.hashed);

      const res = await bcrypt.compare(pass, target.hashed);
      if (res) ctx.user = target;
    }

    ctx.body = ctx.user;
  }

  async me (ctx) {
    ctx.body = ctx.user;
  }

}

module.exports = RestaurantsController;
