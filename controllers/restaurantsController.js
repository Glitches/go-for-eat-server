const bcrypt = require('bcrypt');

let restaurant = {
  name: '',
  email: '',
  // profile_picture: '',
  seats: '',
  owner:'',
  address: '',
  accessToken: ''
};

class RestaurantsController {
  constructor (Restaurants) {
    this.Restaurants = Restaurants;
  }

  async createRestaurant (ctx, next) {
    if (ctx.method !== 'POST') return await next();
    //if none of this -> error
    let { email , password } = ctx.request.body;

    if (!email ) {
      ctx.status = 400;
      ctx.body = 'Please complete all fields';
      return;
    }
    if (!password ) {
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
    // TRY CATCH HERE????
    //password encryption

    let hashed = bcrypt.hashSync(password, 10);

    const newRestaurant = {
      email,
      hashed,
    };

    const restaurant = await this.Restaurants.insert(newRestaurant);

    const accessToken = restaurant._id;
    ctx.status = 201;
    ctx.body = {
      email,
      accessToken
    } ;
  }
}

module.exports = RestaurantsController;