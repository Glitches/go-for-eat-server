'use strict';

const config = require('../config.js');
const monk = require('monk');
const db = monk(process.env.MONGOLAB_URI);
// TODO change monk endpoint

const Events = db.get('events');


// This module expects an object with all the data for creating a new event

//TODO verify if value can be array

module.exports.createEvent = async (ctx, next) => {
	if ('POST' != ctx.method) return await next();
	const newEvent = {
		event_id: ctx.request.body.event_id,
		address: ctx.request.body.address,
		place_id: ctx.request.body.place_id,
		place_name: ctx.request.body.place_name,
		place_address: ctx.request.body.place_address,
		lat: ctx.request.body.lat,
		long: ctx.request.body.long,
		when: ctx.request.body.when,
		participants: [ctx.user._id],
	};

	// TODO: verify multiple insertions? what response?

	const event = await Events.findOne({event_id: newEvent.event_id});
	if (!event) {
		try {
			return Events.insert(newEvent);
		} catch (e) { console.log('Event create error: ', e);}
		ctx.status = 204;
	}
	ctx.status = 403;
};

// Edit event module:
// take the complete event params from request body
module.exports.editEvent = async (ctx, next) => {
	if ('PUT' != ctx.method) return await next();
	const event = await Events.findOne({ event_id: newEvent.event_id });
	if (event) {
		try {
			await Events.update({ event_id: newEvent.event_id }), {
				google_id: ctx.request.body.google_id,
				event_id: ctx.request.body.event_id,
				venue: ctx.request.body.venue,
				lat: ctx.request.body.lat,
				long: ctx.request.body.long,
				when: ctx.request.body.when,
				hour: ctx.request.body.hour,
				participants: ctx.request.body.participants,
				free_spots: ctx.request.body.free_spots
			};
		} catch (e) { console.log('Modify create error: ', e); }
		ctx.status = 204;
		ctx.body = 'The event request does not exist';
	}
};

// Delete event
// uses the ID parsed from the uri

// TODO: is correct ctx.params ?
module.exports.deleteEvent = async (ctx, next) => {
	if ('DELETE' != ctx.method) return await next();
	const event = await Events.findOne({ event_id: ctx.params.id });
	if (event) {
		try {
			await Events.remove({event_id: ctx.params.id});
		} catch(e) { console.log('Deleting event error: ', e);}
	} else {
		ctx.status = 410;
		ctx.body = 'The event does not exist anymore';
	}
};

// GET event informations

// TODO is it Event.get ?
module.exports.getEvent = async (ctx, next) => {
	if ('GET' != ctx.method) return await next();
	const event = await Events.findOne({ event_id: ctx.params.id });
	if (event) {
		ctx.status = 200;
		ctx.body = event;
	} else {
		ctx.status = 404;
		ctx.body = 'The event does not exist';
	}
};

module.exports.joinEvent = async (ctx, next) => {
};

module.exports.leaveEvent = async (ctx, next) => {
};

module.exports.getEvents = async (ctx, next) => {
};