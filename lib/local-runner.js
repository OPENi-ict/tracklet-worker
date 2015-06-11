/**
 * Created by dbenson, dconway on 18/11/2013.
 */

'use strict';

var trackletworker = require('./main.js');

var config = {
   sink : {spec:'tcp://127.0.0.1:49502', bind:true,  id:'tracklet', type:'pull' },
   tracklet : {
      piwik : {
         token_auth : '90871c8584ddf2265f54553a305b6ae1',
         domain : 'http://localhost:8888/piwik/'
      },
      mysql : {
         host : 'localhost',
         user : 'piwik',
         password : 'password',
         database : 'piwik',
         multipleStatements : 'true'
      }
   }
};


trackletworker(config);