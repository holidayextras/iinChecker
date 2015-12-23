'use strict';
var cacheWrapper = require( 'cache-wrapper' );
var cache = module.exports = {};

cache.start = function( cacheConfig, cachePolicy ) {
  return cacheWrapper.initialise( cacheConfig, cachePolicy );
};

cache.set = function( key, data, cachePolicy ) {
  return cacheWrapper.set( {
    segment: cachePolicy[0].segment,
    key: key,
    value: data
  } );
};

cache.get = function( key, cachePolicy ) {
  return cacheWrapper.get( {
    segment: cachePolicy[0].segment,
    key: key
  } );
};
