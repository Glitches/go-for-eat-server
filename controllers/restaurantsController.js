
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
    let { name , password , mail, seats, owner, address} = ctx.request.body;
    // const requirement = ((name &&
    // password &&
    // mail &&
    // seats &&
    // owner &&
    // address));
    // console.log(name);

    // if (!requirement) {
    //   ctx.status = 400;
    //   ctx.body = 'Please complete all fields';
    // }

    //password encryption
    const bcrypt = require('bcrypt');

    let hashed = bcrypt.hashSync(password, 10);

    const newRestaurant = {
      name,
      hashed,
      mail,
      seats,
      owner,
      address,
    };

    const restaurant = await this.Restaurants.insert(newRestaurant);
    console.log(restaurant);

    const accessToken = restaurant._id;
    ctx.status = 201;
    ctx.body = {
      mail,
      accessToken
    } ;
  }
}

module.exports = RestaurantsController;