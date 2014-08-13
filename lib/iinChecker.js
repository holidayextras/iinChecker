
/**
* @name /lib/iinChecker.js
* @description Issuer identification number checker which returns details about a credit/debit card
* @author Simon Wood <simon.wood@holidayextras.com>
*/

( function() {
	
	// get some stuff we need to support Praetorian
	var _ = require( 'lodash' );
	
	var iinChecker = function( inOptions ) {

		// default options
		this.options = {
			language: 'en'
		}

		// if there's any overriding options, blat them over the defaults
		this.options = _.extend( this.options, inOptions );

		// now fetch the language settings based on the requested language
		this.options.messages = require( './i18n/' + this.options.language ); // ISO 639‑1
	};

	// create a shorthand then export the IinChecker object for Nodejs
	exports = module.exports = iinChecker;
	
	/**
	 * Lookup a card by its IIN and return a card object
	 *
	 * @param  {String} iin
	 * @param  {Function} callback
	 * @return {Object}
	 */
	iinChecker.prototype.lookup = function( iin, callback ) {
		try {
			// convert input to sting incase a int is passed in
			iin = String( iin );

			var cardInfo = {
											"bin": "492182",
											"brand": "VISA",
											"issuer": "LLOYDS TSB BANK PLC",
											"type": "DEBIT",
											"category": "PREMIER   cm, sdfrtyusdgtdfsfsedbcv  cxvbn",
											"country": "GB"
										};
			
			if( !_.isObject( cardInfo ) ) {
				throw new TypeError( self.options.messages.PARAMETER_CARDINFO_NOT_OBJECT );
			}
			if( !_.isFunction( callback ) ) {
				throw new TypeError( self.options.messages.PARAMETER_CALLBACK_NOT_FUNCTION );
			}
			
			// send the results back a-la-node
			callback( null, cardInfo );
		} catch ( err ) {
			// Return the err in the error callback, if not possible return it.
			if ( callback ) {
				callback( err );
			} else {
				return err;
			}
		}
	}
	
	// Define card object down here with methods on it
	
	// TODO: Later add isCredit, isDebit, maybe other methods
} )();