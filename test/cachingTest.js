 /*eslint no-unused-expressions:0 */
'use strict';
var chai = require( 'chai' );
var dirtyChai = require('dirty-chai');
chai.use(dirtyChai);
var expect = chai.expect;
var sinon = require( 'sinon' );
var IinChecker = require( '../index' );
var Q = require( 'q' );
var nock = require( 'nock' );
var path = require( 'path' );
var cache = {
  get: function() {},
  set: function() {}
};
var provider = {
  name: 'RIBBON',
  domain: 'http://bins.ribbon.co',
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
var cardToLookup = '411111';
var getCacheStub;
var setCacheStub;
var iin;
var cardDetails = path.join( __dirname, 'fixtures', provider.name, cardToLookup ) + '.json';


describe( 'iinChecker()', function() {

  describe( 'When a cache object is passed in', function() {

    var stubRequest = function( providerDetails, requestedIin ) {
      nock( provider.domain ).get( provider.path + requestedIin ).replyWithFile( 200, cardDetails );
    };

    describe( 'When iin details not in cache', function() {
      before( function( done ) {
        // stub the cache.get function
        getCacheStub = sinon.stub( cache, 'get', function() {
          return Q.reject( 'Cache failed' );
        } );
        // stub the cache.set function
        setCacheStub = sinon.stub( cache, 'set' );
        // initialise  iinChecker with cache
        iin = new IinChecker( {
          cache: cache
        } );

        done();
      } );

      after( function() {
        getCacheStub.restore();
        setCacheStub.restore();
      } );
      stubRequest( provider, cardToLookup );

      // lookupCard( cardToLookup );
      it( 'should get card details from provider and set ii in cache', function() {
        iin.lookup( cardToLookup, function( err, result ) {
          if ( err ) {
            throw ( err );
          } else {
            expect( result ).to.deep.equal( cardDetails );
            expect( setCacheStub.calledOnce ).to.equal(true);
          }
        } );
      } );
      it( 'should have attempted to get cardDetails from cache', function() {
        expect( getCacheStub.calledOnce ).to.equal(true);
      } );

    } );

    describe( 'When iin details is in cache', function() {
      before( function( done ) {
        // stub the cache.get function
        getCacheStub = sinon.stub( cache, 'get', function() {
          return Q.resolve( 'Result from cache' );
        } );
        // stub the cache.set function
        setCacheStub = sinon.stub( cache, 'set' );
        // initialise  iinChecker with cache
        iin = new IinChecker( {
          cache: cache
        } );
        done();
      } );

      after( function() {
        getCacheStub.restore();
        setCacheStub.restore();
      } );

      // lookupCard( cardToLookup );
      it( 'should get  card details from cache', function() {
        iin.lookup( cardToLookup, function( err, result ) {
          if ( err ) {
            throw ( err );
          } else {
            expect( getCacheStub.calledOnce ).to.equal(true);
            expect( result ).to.be.equal.to( 'Result from cache' );
          }
        } );
      } );

      it( 'will not  attempt set cardDetails in cache', function() {
        expect( setCacheStub.called ).to.be.false;
      } );
    } );
  } );
} );
