var IinChecker = require( './index' );
var iin = new IinChecker( {} );

iin.lookup( '431940', function( err, testVisaDebitCard ) {
	console.log( err );
	console.log( testVisaDebitCard );
} );