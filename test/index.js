/* jshint -W098 */
/* jshint expr:true */

var should = require( 'chai' ).should();
var IinChecker = require( '../index' );
var iin = new IinChecker( {} );
var nock = require('nock');

describe( '#pass in invalid params', function() {
	it( 'should lookup a card with undefined iin and error gracefully', function( done ) {
		iin.lookup( undefined, function( err, result ) {
			err.should.be.an( 'object' );
			err.message.should.equal( iin.options.messages.PARAMETER_IIN_IS_UNDEFINED );
			done();
		} );
	} );
	it( 'should lookup a card with empty iin and error gracefully', function( done ) {
		iin.lookup( '', function( err, result ) {
			err.should.be.an( 'object' );
			err.message.should.equal( iin.options.messages.PARAMETER_IIN_IS_EMPTY );
			done();
		} );
	} );
	it( 'should lookup a card with undefined callback and error gracefully', function( done ) {
		var result = iin.lookup( '411111' );
		result.message.should.equal( iin.options.messages.PARAMETER_CALLBACK_NOT_FUNCTION );
		done();
	} );
	it( 'should return an error of not a number', function( done ) {
		iin.lookup( 'foobar', function( err, result ) {
			err.should.be.an( 'object' );
			err.message.should.equal( iin.options.messages.PARAMETER_IIN_IS_NOT_A_NUMBER );
			done();
		} );
	} );
	it( 'should return an error of not long enough', function( done ) {
		iin.lookup( '123', function( err, result ) {
			err.should.be.an( 'object' );
			err.message.should.equal( iin.options.messages.PARAMETER_IIN_IS_NOT_LONG_ENOUGH );
			done();
		} );
	} );
} );

// Load all of our providers into an array that we can loop over.
var providers = require( '../configs/providers' );

// Lets read our providers in from the config and loop over them
providers.forEach( function( provider ) {

	var stubRequest = function( iin ) {
		if( provider.domain ) {
			// Make sure our string comparisons don't get caught out by case issues by converting to uppercase
			if ( iin !== '111111' ) {
				nock( provider.domain ).get( provider.path + iin ).replyWithFile( 200, __dirname + '/fixtures/' + provider.name + '/' + iin + '.json' );
			} else {
				nock( provider.domain ).get( provider.path + iin ).reply( 404, '404 page not found' );
			}
		}
	};

	// This will stop all further calls to this provider from functioning...Please make sure you call this on the last line of your last test function
	var breakProvider = function() {
		if( provider.domain ) {
			nock( provider.domain ).persist().get( '*' ).reply( 500 );
		}
	};

	describe( '#lookup a card using ' + provider.name, function() {
		var testGenCard;
		it( 'should lookup a card without error', function( done ) {
			var iinToLookup = '411111';
			stubRequest( iinToLookup );
			iin.lookup( iinToLookup, function( err, result ) {
				if ( err ) {
					throw( err );
				} else {
					testGenCard = result;
					done();
				}
			} );
		} );

		it( 'iin lookup returns card as an object', function( done ) {
			testGenCard.should.be.an( 'object' );
			done();
		} );

		it( 'card object returned contains the correct properties', function( done ) {
			testGenCard.should.have.property( 'iin' );
			testGenCard.should.have.property( 'brand' );
			testGenCard.should.have.property( 'issuer' );
			testGenCard.should.have.property( 'category' );
			testGenCard.should.have.property( 'country' );
			done();
		} );

		it( 'should lookup an invalid card and error gracefully', function( done ) {
			var iinToLookup = '111111';
			stubRequest( iinToLookup );
			iin.lookup( iinToLookup, function( err, result ) {
				err.should.not.be.null;
				err.should.not.be.undefined;
				done();
			} );
		} );
	} );

	describe( '#lookup visa debit using ' + provider.name, function() {
		var testVisaDebitCard;
		it( 'should lookup a card without error', function( done ) {
			var iinToLookup = '431940';
			stubRequest( iinToLookup );
			iin.lookup( iinToLookup, function( err, result ) {
				if ( err ) {
					throw( err );
				} else {
					testVisaDebitCard = result;
					done();
				}
			} );
		} );

		it( 'card is of type debit', function( done ) {
			if( testVisaDebitCard.type ) {
				testVisaDebitCard.type.should.equal( iin.types.DEBIT );
			}
			done();
		} );

		it( 'card is of brand visa', function( done ) {
			testVisaDebitCard.brand.should.equal( iin.brands.VISA );
			done();
		} );
	} );

	describe( '#lookup mastercard credit using ' + provider.name, function() {
		var testMasterCreditCard;
		it( 'should lookup a card without error', function( done ) {
			var iinToLookup = '518791';
			stubRequest( iinToLookup );
			iin.lookup( iinToLookup, function( err, result ) {
				if ( err ) {
					throw( err );
				} else {
					testMasterCreditCard = result;
					done();
				}
			} );
		} );

		it( 'card is of type credit', function( done ) {
			if( testMasterCreditCard.type ) {
				testMasterCreditCard.type.should.equal( iin.types.CREDIT );
			}
			done();
		} );

		it( 'card is of brand mastercard', function( done ) {
			testMasterCreditCard.brand.should.equal( iin.brands.MASTERCARD );
			// This is the final test...we are all done with the provider, so let's mock them being broken, so that fallback will work for the subsequent provider
			breakProvider();
			done();
		} );
	} );
} );
