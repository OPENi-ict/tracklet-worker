//can the client id be used?
//Store the client id and the admin cloudlet id

var async        = require('async')
var tracklet     = require('tracklet');
var couchbase    = require('couchbase');
var cluster      = new couchbase.Cluster('couchbase://127.0.0.1');
var userBucket   = cluster.openBucket('users');
var typeBucket   = cluster.openBucket('types');
var ViewQuery    = couchbase.ViewQuery;


var developer_cache = {}
var type_cache      = {}


var init = function(tracklet_config){
   tracklet.config(tracklet_config);
}


var getAccessType = function(cloudlet, third_party){
   if ( third_party === cloudlet ){
      return "user"
   }
   else if (0 === third_party.indexOf("c_")) {
      return "developer"
   }
   else {
      return "app"
   }
}


var logAccess = function (cloudlet_id, third_party, object_id, type_id, third_party_cloudlet, client_name, headers) {

   var accessType = getAccessType(cloudlet_id, third_party)

   if ("user" === accessType){
      return
   }

   async.series([
         function (callback) {

            if (undefined !== developer_cache[third_party_cloudlet]) {
               callback(null, developer_cache[third_party_cloudlet]);
               return
            }

            var userQuery = ViewQuery.from('user_views', 'get_name').key(third_party_cloudlet).stale(ViewQuery.Update.BEFORE);

            userBucket.query(userQuery, function (err, results) {

               if (err) {
                  callback(err);
               }

               if (undefined === results || null === results || 0 === results.length) {
                  process.exit()
                  callback('no results');
               }
               else {
                  var developer = results[0].value;
                  developer_cache[third_party_cloudlet] = developer
                  callback(null, developer);
               }
            });
         },
         function (callback) {

            if ("developer" === accessType){
               callback(null, developer_cache[third_party]);
            }
            else{
               callback(null, client_name);
            }
         },
         function (callback) {


            if (undefined !== type_cache[type_id]) {
               callback(null, type_cache[type_id]);
               return
            }

            var typeQuery = ViewQuery.from('type_views', 'get_ref').key(type_id);

            typeBucket.query(typeQuery, function (err, results) {

               if (err) {
                  callback(err);
               }

               if (undefined === results || null === results || 0 === results.length) {
                  callback('no results');
               }
               else {
                  var typeReference = results[0].value;
                  type_cache[type_id] = typeReference
                  callback(null, typeReference);
               }
            });

         }],
      function (err, results) {

         if (err) {
            console.log(err);
         }
         else {

            //console.log("results", results)

            var developer = results[0]
            var app       = results[1]
            var ref       = results[2]

            //return

            var ip = headers["x-forwarded-for"]

            if (null === ip || undefined === ip){
               ip = headers["REMOTE_ADDR"]
            }

            tracklet.track({
               cloudlet  : cloudlet_id,
               app       : app,
               company   : developer,
               object    : object_id,
               objData   : ref,
               ip        : ip
            }, function (error) {
               if (error) {
                  console.log(error);
               }
            });
         }
      });
}


module.exports.init       = init
module.exports.logAccess  = logAccess