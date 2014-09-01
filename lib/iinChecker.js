
/**
* @name /lib/iinChecker.js
* @description Issuer identification number checker which returns details about a credit/debit card
* @author Simon Wood <simon.wood@holidayextras.com>
*/

( function() {
	// get some stuff we need to support IIN Checker
	var _ = require( 'lodash' );
	var request = require( 'request' );
	// Load all of our providers into an array that we can loop over.
	var providers = require( '../configs/providers' );

	var iinChecker = function( inOptions ) {
		// default options
		this.options = {
			language: 'en'
		};

		// if there's any overriding options, blat them over the defaults
		this.options = _.extend( this.options, inOptions );

		// Define our constants for comparison
		this.nullValue = 'UNKNOWN'; /* Value incase services are offline or return null */
		this.brands = {
			'VISA': 'VISA',
			'MASTERCARD':  'MASTERCARD',
			'AMEX': 'AMERICAN EXPRESS',
			'DISCOVER': 'DISCOVER ',
			'JCB': 'JCB',
			'MAESTRO': 'MAESTRO',
			'LASER': 'LASER',
		};
		// DANKORT what do we do with this?
		// CHINA UNION PAY
		// SOLO
		// ELECTRON ??? Don't support? Visa Electron

		this.types = {
			'DEBIT': 'DEBIT',
			'CREDIT': 'CREDIT',
			'UNKNOWN': this.nullValue
		};

		// now fetch the language settings based on the requested language
		this.options.messages = require( './i18n/' + this.options.language ); // ISO 639‑1

		this.makeRequest = function( iin, providerCount, callback ) {
			var self = this;
			var providerDetails = providers[providerCount];
			request( { url: providerDetails.domain + providerDetails.path + iin, json: true }, function( error, response, body ) {
				if ( !error && response.statusCode === 200 ) {
					// Remap the reply to match our schema
					var cardInfo = providerDetails.map( body, self.nullValue );
					// send the results back a-la-node
					callback( null, cardInfo );
				} else {
					if( providerCount <= providers.length ) {
						self.makeRequest( iin, ++providerCount, callback );
					} else {
						throw error;
					}
				}
			} );
		};
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

			// First up. Make sure we are passing a number in.
			if( _.isNaN( parseInt( iin ) ) ) {
				throw new TypeError( this.options.messages.PARAMETER_IIN_IS_NOT_A_NUMBER );
			}

			if ( _.isUndefined( iin ) ) {
				throw new TypeError( this.options.messages.PARAMETER_IIN_IS_UNDEFINED );
			} else {
				if ( _.isEmpty( iin ) ) {
					throw new TypeError( this.options.messages.PARAMETER_IIN_IS_EMPTY );
				} else {
					// convert input to string incase a int is passed in
					iin = String( iin );

					// Now make sure that we are passing in 6 characters
					if( iin.length !== 6 ) {
						throw new TypeError( this.options.messages.PARAMETER_IIN_IS_NOT_LONG_ENOUGH );
					}

				}
			}
			if ( !_.isFunction( callback ) ) {
				throw new TypeError( this.options.messages.PARAMETER_CALLBACK_NOT_FUNCTION );
			}
			this.makeRequest( iin, 0, callback );
		} catch ( err ) {
			// Return the err in the error callback, if not possible return it.
			if ( callback ) {
				callback( err );
			} else {
				return err;
			}
		}
	};
} )();