'use strict';

const Raven = require('raven');

class MeetingsController {
  constructor (Meetings) {
    this.Meetings = Meetings;
  }

  async createMeeting (ctx, next) {
    if ('POST' != ctx.method) return await next();
    // console.log(ctx.header);

    const { date, time, seats } = ctx.request.body;
    // get the accestoken from header and store it in organiser

    if (!date || !time || !seats ) {
      ctx.status = 400;
      ctx.body = 'Please complete all fields';
      return;
    }
    try {
      //TODO add time spread check
      const dateCheck = await this.Meetings.findOne({date});
      if (dateCheck) {
        ctx.status = 400;
        ctx.body = 'You already have a meeting on that date\nPlease choose another day';
        return;
      }
    } catch (e) {
      Raven.captureException(e);
      ctx.status = 500;
    }
    const newMeeting = {
      date,
      time,
      seats,
      organiser,
      timestamp: Date.now(),
    };

    const meeting = await this.Meetings.insert(newMeeting);

    ctx.status = 201;

    ctx.body = 'Event created!';
  }

  async deleteMeeting (ctx, next) {
    if ('DELETE' != ctx.method) return await next();
    try {
      const paramId = ctx.params.id;
      const meeting = await this.Meetings.findOne({
        _id: paramId,
        creator: ctx.user._id// restaurant??
      });
      // if (meeting && meeting.attendees.length === ) {
      //   await this.Events.remove({ _id: paramId });
      // } else return (ctx.status = 404);
      // ctx.status = 204;
    } catch (e) {
      Raven.captureException(e);
      ctx.status = 500;
    }
  }

  async getMeeting (ctx, next) {
    if ('GET' != ctx.method) return await next();
    try {
      const paramId = ctx.params.id;
      const event = await this.Meetings.aggregate([
        { $match: { _id: paramId } },
        {
          $lookup: {
            from: 'users',
            localField: 'attendees',
            foreignField: '_id',
            as: 'attendees'
          }
        },
        {
          $project: {
            'attendees.email': 0,
            'attendees.birthday': 0,
            'attendees.gender': 0,
            'attendees.events': 0,
            'attendees.created_events': 0,
            'attendees.accessToken': 0,
            'attendees.ratings_average': 0,
            'attendees.ratings_number': 0,
            'attendees.profession': 0,
            'attendees.description': 0,
            'attendees.interests': 0
          }
        }
      ]);
      ctx.status = 200;
      ctx.body = event;
    } catch (e) {
      Raven.captureException(e);
      cotx.status = 500;
    }
  }

  async editMeeting (ctx, next) {
    const restaurant = ctx.user;
  }

}

module.exports = MeetingsController;
