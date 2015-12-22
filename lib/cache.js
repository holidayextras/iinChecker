'use strict';
var cacheWrapper = require( 'cache-wrapper' );
var cache = module.exports = {};
cache.policy = [
  {
    'segment': 'iinChecker',
    'expiresIn': 86400000
  }
];

cache.start = function( cacheConfig ) {
  return cacheWrapper.initialise( cacheConfig, cache.policy );
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
