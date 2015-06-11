/*
 * DAO
 *
 *
 * Copyright (c) 2013 dconway, dmccarthy
 * Licensed under the MIT license.
 */

'use strict';

var zmq                 = require('zmq');
var zmqM2Node           = require('m2nodehandler');
var helper              = require('./helper')


var dao = function(config) {

   helper.init(config.tracklet)

   zmqM2Node.receiver(config.sink, null, function(msg) {

      helper.logAccess(msg.cloudlet,
         msg.third_party,
         msg.object_id,
         msg.type_id,
         msg.third_party_cloudlet,
         msg.client_name,
         msg.headers
      )

   });
};


module.exports = dao;