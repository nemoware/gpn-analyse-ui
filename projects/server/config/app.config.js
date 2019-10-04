const db = {
  name: process.env.GPN_DB_NAME,
  port: process.env.GPN_DB_PORT,
  host: process.env.GPN_DB_HOST
};

const ad = {
  url: process.env.GPN_AD_URL,
  baseDN: process.env.GPN_AD_BASEDN,
  username: process.env.GPN_AD_USERNAME,
  password: process.env.GPN_AD_PASS,
  groupName: process.env.GPN_AD_GROUP_NAME,
  on: true,
  login: 'admin',
  auth: null
};

function useAd(adOn, login) {
  if (adOn != null) {
    this.ad.on = adOn;
  }
  if (login != null) {
    this.ad.login = login;
  }

  let ad;
  if (adOn) {
    this.ad.auth = require('../authorization/adAuthorization');
  } else {
    this.ad.auth = require('../authorization/fakeAuthorization');
  }
}

module.exports = { db, ad, useAd };
