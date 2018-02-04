'use strict';

const config = require('../config.js');

const regexLat = /^[-+]?([1-8]?\d(\.\d+)?|90(\.0+)?)$/;
const regexLng = /^[-+]?(180(\.0+)?|((1[0-7]\d)|([1-9]?\d))(\.\d+)?)$/;

class EventsController {
  constructor (Events, monk) {
    this.Events = Events;
    this.monk = monk;
  }
  
  async createEvent (ctx, next) {
    if ('POST' != ctx.method) return await next();
    const newEvent = {
      place_id: ctx.request.body.place_id,
      place_name: ctx.request.body.place_name,
      place_address: ctx.request.body.place_address,
      location: ctx.request.body.location,
      when: ctx.request.body.when,
      creator: ctx.user._id,
      attendees: [ctx.user._id],
    };
    try {
      for (const key in newEvent) {
        if (!newEvent[key]) throw `Empty parameter ${[key]}`;
      }
      if (!ctx.request.body.location.coordinates[1] || !ctx.request.body.location.coordinates[0] ) throw 'Latitude and or Longitude not present';
      if (!regexLat.test(ctx.request.body.location.coordinates[0])) throw 'Not valid latitude or Latitude';
      if (!regexLng.test(ctx.request.body.location.coordinates[1])) throw 'Not valid latitude or Longitude';
      const event = await this.Events.insert(newEvent);
      ctx.status = 201;
      ctx.body = JSON.stringify({'event': event});
    } catch (e) { 
      // eslint-disable-next-line no-console
      console.error('Event create error: ', e);
      ctx.status = 400;
    }
  }
  
  async editEvent (ctx, next) {
    if ('PUT' != ctx.method) return await next();
    try {
      for (const key in ctx.request.body) {
        if (!ctx.request.body[key]) throw `Empty parameter ${[key]}`;
      }
      if (!ctx.request.body.location.coordinates[0] || !regexLat.test(ctx.request.body.location.coordinates[0]) ) {
        throw 'Latitude field not present or not an accepted number';
      }
      if (!ctx.request.body.location.coordinates[1] || !regexLng.test(ctx.request.body.location.coordinates[1]) ) {
        throw 'Longitude field not present or not an accepted number';
      }
      const updateResult = await this.Events.update({ _id: ctx.params.id }, { $set: {
        place_id: ctx.request.body.place_id,
        place_name: ctx.request.body.place_name,
        place_address: ctx.request.body.place_address,
        location: ctx.request.body.location,
        when: ctx.request.body.when,
      }});
      if (updateResult.nMatched === 0) throw `Event ${ctx.params.id} not found`;
      ctx.status = 204;
    } catch (e) { 
      // eslint-disable-next-line no-console
      console.error('Modify create error: ', e); 
      ctx.status = 400;
    }
  }

  async deleteEvent (ctx, next)  {
    if ('DELETE' != ctx.method) return await next();
    try {
      const event = await this.Events.findOne({ _id: ctx.params.id, creator: ctx.user._id });
      if (event && event.attendees.length === 1) await this.Events.remove({ _id: this.monk.id(ctx.params.id)});
      else throw `Event not present or only one attendee -> ${Array.isArray(event.attendees)}, ${event.attendees.length}`;   
      ctx.status = 204;
    } catch (e) { 
      // eslint-disable-next-line no-console
      console.error('Deleting event error: ', e);
      ctx.status = 400;
    }
  }

  async getEvent (ctx, next) {
    if ('GET' != ctx.method) return await next();
    try {
      const event = await this.Events.aggregate([
        { $match: { _id: this.monk.id(ctx.params.id) } },
        { $lookup:
          {
            from: 'users',
            localField: 'attendees',
            foreignField: '_id',
            as: 'attendees'
          },
        },
        { $project: {
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
      // eslint-disable-next-line no-console
      console.error('Get Single Event error', e); 
    }
  }

  async joinEvent (ctx, next) {
    if ('PUT' != ctx.method) return await next();
    try {
      const updateResult = await this.Events.update({ _id: ctx.params.id, 'attendees.3': { $exists: false } },
        { $addToSet: { attendees: ctx.user._id }}
      );
      if (updateResult.nMatched === 0) throw `Event ${ctx.params.id} not found`;
      ctx.status = 204;
      // console.log( await this.Events.findOne({_id: ctx.params.id}));
    } catch (e) { 
      // eslint-disable-next-line no-console
      console.error('Update user error', e); 
      ctx.status = 400; 
    }
  }

  async leaveEvent (ctx, next) {
    if ('DELETE' != ctx.method) return await next();
    let event = await this.Events.findOne({
      _id: ctx.params.id,
      attendees: ctx.user._id,
      'attendees.1': { $exists: true }
    });
    // if (!event) throw `Error, event ${ctx.params.id} not found`;
    // console.log('event', event);
    if ( JSON.stringify(event.creator) === JSON.stringify(ctx.user._id) ) {
      event.creator = event.attendees[1];
    }
    try {
      let update = await this.Events.update(
        { _id: ctx.params.id },
        {
          $pull:
            { attendees: ctx.user._id },
          $set:
            { 'creator': event.creator }
        }
      );
      event = await this.Events.findOne({ _id: ctx.params.id });
      ctx.body = JSON.stringify({'event': event});
      ctx.status = 200;
    } catch (e) { 
      // eslint-disable-next-line no-console
      console.error('Leave event error: ', e);
      ctx.status = 400; 
    }
  }

  async getEvents (ctx, next) {
    if ('GET' != ctx.method) return await next();
    try {
      if (!ctx.request.query.lat || !ctx.request.query.lng ) throw 'Latitude and or Longitude not present';
      if (!regexLat.test(ctx.request.query.lat)) throw 'Not valid latitude or Latitude';
      if (!regexLng.test(ctx.request.query.lng)) throw 'Not valid latitude or Longitude';
      const lat = Number(ctx.request.query.lat);
      const lng = Number(ctx.request.query.lng);
      const distance = Number(ctx.request.query.dist) ? Number(ctx.request.query.dist) : 1000;
      const limit = Number(ctx.request.query.limit) ? Number(ctx.request.query.limit) : 100;
      const from = Number(ctx.request.query.from) ? Number(ctx.request.query.from) : Date.now();
      const to = Number(ctx.request.query.to) ? Number(ctx.request.query.to) : Date.now() + 3600*24*7;
      const events = await this.Events.aggregate([
        { $geoNear: {
          near: { type: 'Point', coordinates: [ lat, lng ] },
          distanceField: 'distance',
          maxDistance: distance,
          query: { when: { $gte: from , $lte: to } },
          limit: limit,
          spherical: true
        }
        },
        { $lookup:
        {
          from: 'users',
          localField: 'attendees',
          foreignField: '_id',
          as: 'attendees'
        },
        },
        { $project: {
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
      ctx.body = JSON.stringify(events);
    } catch (e) { 
      // eslint-disable-next-line no-console
      console.error( `getEvents error ${e}`);
      ctx.status = 400; 
    }
  } 
}

module.exports = EventsController;


