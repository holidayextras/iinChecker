'use strict';
var chai = require( 'chai' );
var expect = chai.expect;
var sinon = require('sinon');
var cache = require( '../lib/cache' );
var nock = require('nock');
var IinChecker = require( '../index' );
var q = require('Q');
var path = require( 'path' );

var iin = new IinChecker( {
  cache: true,
  cacheServerConfig: {}
} );
var getCacheStub;
var setCacheStub;
var makeRequestStub;

var cardInfo = {
  status: 'success',
  bin: '411111',
  brand: 'VISA',
  issuer: 'JPMORGAN CHASE BANK, N.A.',
  type: 'CREDIT',
  country_code: 'US'
};

// Load all of our providers into an array that we can loop over.
var provider = {
  name: 'RIBBON',
  domain: 'https://bins.ribbon.co',
  path: '/api/v1/bins/',
  map: function( returnedData, nullValue ) {
    return {
      iin: returnedData.bin,
      brand: returnedData.brand,
      issuer: returnedData.issuer,
      type: ( returnedData.type ? returnedData.type : nullValue ),
      category: nullValue,
      country: returnedData.country_code
    };
  }
};
describe( '#set and retrive card details from in-memory cache', function() {
  before( function() {
    // stub the cache.get function
    getCacheStub = sinon.stub( cache, 'get', function() {
      var deferred = q.defer();
      if (this.get.callCount === 1 ) {
        deferred.reject( 'cache failed' );
      } else {
        deferred.resolve( cardInfo );
      }
      return deferred.promise;
    } );
    // stub the cache.set function
    setCacheStub = sinon.stub( cache, 'set');

    // stub the iin.makeRequest function
    makeRequestStub = sinon.stub( iin, 'makeRequest', function( iinToLookup ) {
      nock( provider.domain ).get( '/api/v1/bins/' + iinToLookup ).replyWithFile( 200, path.join( __dirname, 'fixtures', provider.name, iinToLookup ) + '.json' );
      cache.set( iin, path.join( __dirname, 'fixtures', provider.name, iinToLookup ) + '.json' );
    } );
  } );

  after( function() {
    getCacheStub.restore();
    setCacheStub.restore();
    makeRequestStub.restore();
  } );

  var lookupResults = [];
  var cardToLookup = '411111';
  it( 'lookup a card without error', function( done ) {
    var lookupCard = function( iinToLookup ) {
      iin.lookup( iinToLookup, function( err, result ) {
        if ( err ) {
          throw ( err );
        } else {
          lookupResults.push(result);
        }
      } );
    };
    // multiple card look ups
    lookupCard( cardToLookup );
    lookupCard( cardToLookup );
    lookupCard( cardToLookup );
    done();
  } );

  it( 'Get card details from cache called thrice', function() {
    return expect( getCacheStub.calledThrice ).to.be.true;
  } );

  it( 'Set card details in cache called once', function() {
    return expect( setCacheStub.calledOnce ).to.be.true;
  } );
  it( 'makerequest to provider called once', function() {
    return expect( makeRequestStub.calledOnce ).to.be.true;
  } );
} );






