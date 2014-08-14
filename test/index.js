/* jshint -W098 */
/* jshint expr:true */

var should = require( 'chai' ).should();
var IinChecker = require( '../index' );
var iin = new IinChecker( {} );

// Before each Mocha - Look tomorrow

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
	
	it( 'iin lookup returns card as an object', function( done ) {
		testVisaDebitCard.should.be.a( 'object' );
		done();
	} );

	it( 'card object returned contains the correct properties', function( done ) {
		testVisaDebitCard.should.have.property( 'bin' );
		testVisaDebitCard.should.have.property( 'brand' );
		testVisaDebitCard.should.have.property( 'issuer' );
		testVisaDebitCard.should.have.property( 'type' );
		testVisaDebitCard.should.have.property( 'category' );
		testVisaDebitCard.should.have.property( 'country' );
		done();
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
	iin.lookup( '518791', function( err, testVisaDebitCard ) {
	} );
} );
