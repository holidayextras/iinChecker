/* jshint -W098 */
/* jshint expr:true */

var should = require( 'chai' ).should();
var IinChecker = require( '../index' );
var iin = new IinChecker( {} );

describe( '#lookup a card', function() {
	var testGenCard;
	it( 'should lookup a card without error', function( done ) {
		iin.lookup( '411111', function( err, result ) {
			if ( err ) {
				throw( err );
			} else {
				testGenCard = result;
				done();
			}
		} );
	} );
	
	it( 'iin lookup returns card as an object', function( done ) {
		testGenCard.should.be.a( 'object' );
		done();
	} );

	it( 'card object returned contains the correct properties', function( done ) {
		testGenCard.should.have.property( 'bin' );
		testGenCard.should.have.property( 'brand' );
		testGenCard.should.have.property( 'issuer' );
		testGenCard.should.have.property( 'type' );
		testGenCard.should.have.property( 'category' );
		testGenCard.should.have.property( 'country' );
		done();
	} );
} );

	
describe( '#lookup visa debit', function() {
	var testVisaDebitCard;
	it( 'should lookup a card without error', function( done ) {
		iin.lookup( '431940', function( err, result ) {
			if ( err ) {
				throw( err );
			} else {
				testVisaDebitCard = result;
				done();
			}
		} );
	} );
	
	it( 'card is of type debit', function( done ) {
		testVisaDebitCard.type.should.equal( iin.types.DEBIT );
		done();
	} );

	it( 'card is of brand visa', function( done ) {
		testVisaDebitCard.brand.should.equal( iin.brands.VISA );
		done();
	} );
} );

describe( '#lookup mastercard credit', function() {
	var testMasterCreditCard;
	it( 'should lookup a card without error', function( done ) {
		iin.lookup( '518791', function( err, result ) {
			if ( err ) {
				throw( err );
			} else {
				testMasterCreditCard = result;
				done();
			}
		} );
	} );
		
	it( 'card is of type credit', function( done ) {
		testMasterCreditCard.type.should.equal( iin.types.CREDIT );
		done();
	} );

	it( 'card is of brand mastercard', function( done ) {
		testMasterCreditCard.brand.should.equal( iin.brands.MASTERCARD );
		done();
	} );
} );
