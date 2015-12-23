'use strict';
var cacheWrapper = require( 'cache-wrapper' );
var cache = module.exports = {};

cache.start = function( cacheConfig, cachePolicy ) {
  return cacheWrapper.initialise( cacheConfig, cachePolicy );
};

cache.set = function( key, data ) {
  return cacheWrapper.set( {
    segment: cache.policy[0].segment,
    key: key,
    value: data
  } );
};

cache.get = function( key ) {
  return cacheWrapper.get( {
    segment: cache.policy[0].segment,
    key: key
  } );
};
