<h1 align="center">Go 4 Eat Server</h1>
<div align="center">
<img src="https://github.com/glitches/go-for-eat-server/blob/development/assets/appIcone.png?raw=true">
</div>

# Backend source files for Go 4 Eat App

[![Build Status](https://travis-ci.org/Glitches/go-for-eat-server.svg?branch=development)](https://travis-ci.org/Glitches/go-for-eat-server)

This backend supports server side Google and Facebook `OAuth2.0` authentication and provides DB for users and events.
Also serves Linkedin login web service.
created through [Go 4 Eat app](https://github.com/redspanner/go-for-eat-client).

# Usage

* Make sure you have an instance of **MongoDB** working on your local machine or remote server.

Clone and install the dependencies for the repo:

<code>
git clone git@github.com:sergipt/go-for-eat-server.git

yarn install
</code>

Then you have to create in the main folder a `.env` file with these keys:

<div align="center">

```dotenv
MONGOLAB_URI=<mongodb host>
FACEBOOK_CLIENT=<Facebook client app code>
FACEBOOK_CLIENTSECRET=<Facebook client app secret>
GOOGLE_CONSUMERKEY=<Goggle app consumer key>
GOOGLE_CONSUMERSECRET=<Google app consumer secret>
RAVEN_URI=<Raven logger  dedicate Uri>
```

You''ll find an example .env file in root folder.

</div>

Change the values accordingly to yours.

---

## API tester

* [Postman collection](https://www.getpostman.com/collections/fe388c40163fa169bada)
  * Url pointing to Apiary - change accordingly
* [Apiary mock server APIs](https://go4eat.docs.apiary.io/#reference)

## Tech Stack

* **Monk** - [The wise MongoDb API](https://github.com/Automattic/monk)
* **dotenv** - [Loads enviromnet variables from .env for nodejs projects](https://github.com/motdotla/dotenv)
* **Axios** - [Promise client for node.js](https://github.com/axios/axios)
* **Koa** - [Web framework for node.js](http://koajs.com/)

## External resources

|                                                                 **Mlab**                                                                 |                                                              **Travis-CI**                                                              |                                                                **Sentry**                                                                 |
| :--------------------------------------------------------------------------------------------------------------------------------------: | :-------------------------------------------------------------------------------------------------------------------------------------: | :---------------------------------------------------------------------------------------------------------------------------------------: |
|                                                         Remote MongoDb instance                                                          |                                                        Continous Deployment Tool                                                        |                                                             Exceptions Logger                                                             |
| <img src="https://github.com/Glitches/go-for-eat-server/blob/development/assets/mLab-logo-onlight.png?raw=true" height="80" width="120"> | <img src="https://github.com/Glitches/go-for-eat-server/blob/development/assets/TravisCI-Mascot-1.png?raw=true" height="80" width="80"> | <img src="https://github.com/Glitches/go-for-eat-server/blob/development/assets/sentry-glyph-black.png?raw=true" height="80" width="120"> |
|                                                     [mlab.com](https://www.mlab.com)                                                     |                                                     [travis-ci.org](travis-ci.org)                                                      |                                                   [sentry.io](http://sentry.io/welcome)                                                   |
