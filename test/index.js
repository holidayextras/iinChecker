/* jshint -W098 */
/* jshint expr:true */

var should = require( 'chai' ).should();
var IinChecker = require( '../index' );
var iin = new IinChecker( {} );

describe( '#lookup visa debit', function() {
	iin.lookup( '431940', function( err, testVisaDebitCard ) {
		it( 'iin lookup returns card object', function() {
			testVisaDebitCard.should.be.a( 'object' );
		} );

		it( 'card object returned contains the correct properties', function() {
			testVisaDebitCard.should.have.property( 'bin' );
			testVisaDebitCard.should.have.property( 'brand' );
			testVisaDebitCard.should.have.property( 'issuer' );
			testVisaDebitCard.should.have.property( 'type' );
			testVisaDebitCard.should.have.property( 'category' );
			testVisaDebitCard.should.have.property( 'country' );
		} );
	} );
} );


describe( '#lookup mastercard credit', function() {
	iin.lookup( '518791', function( err, testVisaDebitCard ) {

	} );
} );

//card.toJson();

// Maybe factory patern, with card obj returned?
// Put consts in the file!
