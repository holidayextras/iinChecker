/* jshint -W098 */
/* jshint expr:true */

var chai = require( 'chai' );
var expect = chai.expect;
var sinon = require('sinon');
var cache =  require( '../lib/cache' );
var nock = require('nock');
var IinChecker = require( '../index' );
var q = require('Q');

var iin = new IinChecker( {
	cache: true,
	cacheServerConfig: {}
} );
var getCache;
var setCache;
var makeRequestStub;

var cardInfo = {
	status: 'success',
	bin: '411111',
	brand: 'VISA',
	issuer: 'JPMORGAN CHASE BANK, N.A.',
	type: 'CREDIT',
	country_code: 'US'
}

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
		}
	}
}
var cardToLookup = '411111';
describe( '#set and retrive card details from in-memory cache', function() {
	before( function() {
		// stub the cache.get function
		getCacheStub = sinon.stub( cache, 'get',function( iin ) {
			var deferred = q.defer();
			if(this.get.callCount === 1 ) {
				deferred.reject( 'cache failed' );
			}
			else {
				deferred.resolve( cardInfo );
			}
			return deferred.promise;
		} );
		// stub the cache.set function
		setCacheStub = sinon.stub( cache, 'set');

		// stub the iin.makeRequest function
		makeRequestStub = sinon.stub( iin, 'makeRequest', function( iin ) {
			nock( provider.domain ).get( '/api/v1/bins/' + iin ).replyWithFile( 200, __dirname + '/fixtures/' + provider.name + '/' + iin + '.json' );
			cache.set( iin, __dirname + '/fixtures/' + provider.name + '/' + iin + '.json' );
		} );
	} );

	after( function() {
		getCacheStub.restore();
		setCacheStub.restore();
		makeRequestStub.restore();
	} );

	var lookupResults = [];
	var cardToLookup = '411111';
	it( 'should lookup a card without error', function( done ) {
		var lookupCard = function( iinToLookup ) {
			iin.lookup( iinToLookup, function( err, result ) {
				if ( err ) {
					throw( err );
				} else {
					lookupResults.push(result);
				}
			} );
		}
		// multiple card look ups
		lookupCard( cardToLookup );
		lookupCard( cardToLookup );
		lookupCard( cardToLookup );
		done();
	} );

	it( 'Get card details from cache called thrice', function( done ) {
		expect(getCacheStub.calledThrice).to.be.true;
		done();
	} );

	it( 'Set card details in cache called once', function( done ) {
		expect(setCacheStub.calledOnce).to.be.true;
		expect(makeRequestStub.calledOnce).to.be.true;

		done();
	} );
} );






