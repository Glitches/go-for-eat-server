
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
    const newRestaurant = {
      name: ctx.request.body.name,
      mail: ctx.request.body.mail,
      seats: ctx.request.body.seats,
      owner: ctx.request.body.owner,
      address: ctx.request.body.address
    };

    const restaurant = await this.Restaurants.insert(newRestaurant);
    ctx.status = 201;
    ctx.body = { restaurant };
  }
}

module.exports = RestaurantsController;