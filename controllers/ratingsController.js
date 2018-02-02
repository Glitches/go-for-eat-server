'use strict';

const config = require('../config.js');
const monk = require('monk');
const db = monk(process.env.MONGOLAB_URI);

const Ratings = db.get('ratings');
const Users = db.get('users');


module.exports.rating = async (ctx, next) => {
	if ('PUT' != ctx.method) return await next();
  let rating = await Ratings.findOne({_id: ctx.params.id, author: ctx.user._id});
  if (!rating ) {
    try {
      await Ratings.insert({
        user_id: ctx.params.id,
        author: ctx.request.body.author,
        rating: ctx.request.body.rating,
      });
      let user = await Users.findOne({_id: ctx.params.id});
      user.ratings_average = (user.ratings_average * user.ratings_number + ctx.request.body.rating) / (user.ratings_number + 1);
      user.ratings_number++;
      await Users.update({ _id: ctx.params.id }, { $set: {
        ratings_number: user.ratings_number,
        ratings_average: user.ratings_average,
      }});
      ctx.status = 200;
	    ctx.body = {ratings_average: user.ratings_average, ratings_number: user.ratings_number};
    } catch(e) { console.error('Rating user error', e);}
  } else {
    ctx.status = 403;
  }
};