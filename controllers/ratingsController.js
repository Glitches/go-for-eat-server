'use strict';

const config = require('../config.js');
const monk = require('monk');
const db = monk(process.env.MONGOLAB_URI);
const Raven = require('raven');

process.env.ENV === 'production' &&
  Raven.config(process.env.SENTRY_DSN).install();

class RatingsController {
  constructor (Ratings, Users) {
    this.Ratings = Ratings;
    this.Users = Users;
  }

  async rateUser (ctx, next) {
    if ('PUT' != ctx.method) return await next();
    try {
      const paramId = ctx.params.id;
      const user = await this.Users.findOne({
        _id: ctx.params.id
      });
      if (!user) {
        ctx.status = 404;
        ctx.body = 'User not found';
      }
      const rating = await this.Ratings.findOne({
        user_id: paramId,
        author: ctx.user._id
      });
      if (!rating) {
        await this.Ratings.insert({
          user_id: paramId,
          author: ctx.user._id,
          rating: ctx.request.body.rating
        });
      } else {
        await this.Ratings.update(
          {
            $and: [{ user_id: paramId }, { author: ctx.user._id }]
          },
          {
            $set: {
              rating: ctx.request.body.rating
            }
          }
        );
      }
      user.ratings_average =
        !user.ratings_average && !user.ratings_number
          ? Number(ctx.request.body.rating)
          : (user.ratings_average * user.ratings_number +
              Number(ctx.request.body.rating)) /
            (user.ratings_number + 1);
      user.ratings_number++;
      user.ratings_average = Math.round(user.ratings_average * 10) / 10;
      await this.Users.update(
        { _id: paramId },
        {
          $set: {
            ratings_number: user.ratings_number,
            ratings_average: user.ratings_average
          }
        }
      );
      ctx.status = 200;
      ctx.body = {
        ratings_average: user.ratings_average,
        ratings_number: user.ratings_number
      };
    } catch (e) {
      Raven.captureException(e);
    }
  }
}

module.exports = RatingsController;
