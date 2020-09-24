'use strict';

const passport = require('passport');
const passportJwt = require('passport-jwt');
const jwt = require('jsonwebtoken');
const JwtStrategy = passportJwt.Strategy;

const config = require('../config').jwt;
const options = config.options;
options.jwtFromRequest = req => req && req.cookies && req.cookies.jwt;

passport.use(
  new JwtStrategy(options, async (payload, done) => {
    if (payload) {
      delete payload.iat;
      delete payload.exp;
      return done(null, payload);
    }

    return done(null, false);
  })
);

exports.authenticate = function jwtAuthentication(req, res, next) {
  passport.authenticate('jwt', (err, user) => {
    if (user) {
      res.locals.user = user;
      return next();
    }

    if (err) {
      console.log(err);
    }

    res.clearCookie('jwt');
    return next();
  })(req, res, next);
};

exports.getAccessToken = payload => {
  return jwt.sign(payload, options.secretOrKey, {
    expiresIn: config.expiresIn
  });
};
