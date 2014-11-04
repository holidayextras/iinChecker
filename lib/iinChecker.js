
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
			'DISCOVER': 'DISCOVER',
			'DINERS': 'DINERS CLUB',
			'JCB': 'JCB',
			'MAESTRO': 'MAESTRO',
			'LASER': 'LASER',
			'UNKNOWN': this.nullValue
		};
		// DANKORT what do we do with this?
		// CHINA UNION PAY
		// SOLO
		// ELECTRON ??? Don't support? Visa Electron
		
		// DINERS has been added for RegEx, but both Robbin and BinList return these cards as DISCOVER
		// TODO: Change this later to be consitent across RegEx and providers

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
					if( ++providerCount < providers.length ) {
						self.makeRequest( iin, providerCount, callback );
					} else {
						// Maybe one last attempt here with RegEx? If that does not work then error
						var patterns = require( '../configs/patterns' );
						
						// Set out null info object
						var cardInfo = {
							iin: iin,
							brand: null,
							issuer: self.nullValue,
							type: self.nullValue,
							category: self.nullValue,
							country: self.nullValue
						}
						
						_.each( patterns, function( pattern ) {
							var regex = new RegExp( pattern.expression );
							if( !cardInfo.brand && regex.test( iin ) ) {
								cardInfo.brand = self.brands[pattern.name];
							}
						} );
						
						// See if RegEx worked
						if ( cardInfo.brand ) {
							console.log( 'HERE: ', cardInfo.brand );
							callback( null, cardInfo );
						} else {
							console.log( 'HELPME: ', cardInfo.brand );
							// Return the err in the error callback, or if no error send back the http status code
							callback( error || response.statusCode );
						}
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

			if ( _.isUndefined( iin ) ) {
				throw new TypeError( this.options.messages.PARAMETER_IIN_IS_UNDEFINED );
			} else {
				if ( _.isEmpty( iin ) ) {
					throw new TypeError( this.options.messages.PARAMETER_IIN_IS_EMPTY );
				} else {
					// convert input to string incase a int is passed in
					iin = String( iin );

					// First up. Make sure we are passing a number in.
					if( _.isNaN( parseInt( iin ) ) ) {
						throw new TypeError( this.options.messages.PARAMETER_IIN_IS_NOT_A_NUMBER );
					}

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