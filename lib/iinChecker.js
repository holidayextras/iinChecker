'use strict';
( function() {
  // get some stuff we need to support IIN Checker
  var _ = require( 'lodash' );
  var request = require( 'request' );
  // Load all of our providers into an array that we can loop over.
  var providers = require( '../configs/providers' );

  var iinChecker = function( iinOptions ) {
    // default options
    this.options = {
      language: 'en',
      cache: false
    };
    // if there's any overriding options, blat them over the defaults
    this.options = _.extend( this.options, iinOptions );

    // Define our constants for comparison
    this.nullValue = 'UNKNOWN'; /* Value incase services are offline or return null */
    this.brands = {
      VISA: 'VISA',
      MASTERCARD: 'MASTERCARD',
      AMEX: 'AMERICAN EXPRESS',
      DISCOVER: 'DISCOVER',
      DINERS: 'DINERS CLUB',
      JCB: 'JCB',
      MAESTRO: 'MAESTRO',
      LASER: 'LASER',
      UNKNOWN: this.nullValue
    };
    // DANKORT what do we do with this?
    // CHINA UNION PAY
    // SOLO
    // ELECTRON ??? Don't support? Visa Electron

    // DINERS has been added for RegEx, but both Robbin and BinList return these cards as DISCOVER
    // TODO: Change this later to be consitent across RegEx and providers

    this.types = {
      DEBIT: 'DEBIT',
      CREDIT: 'CREDIT',
      UNKNOWN: this.nullValue
    };

    // now fetch the language settings based on the requested language
    this.options.messages = require( './i18n/' + this.options.language ); // ISO 639‑1

    this.isCacheable = function( cardInfo ) {
      if ( this.options.cache &&
          cardInfo.brand && cardInfo.brand !== this.brands.UNKNOWN &&
          cardInfo.type && cardInfo.type !== this.nullValue
      ) {
        return true;
      }
      return false;
    };

    this.makeRequest = function( iin, providerCount, callback ) {
      var self = this;
      var cardInfo;
      var providerDetails = providers[providerCount];

      request( { url: providerDetails.domain + providerDetails.path + iin, json: true }, function( error, response, body ) {
        if ( !error && response.statusCode === 200 ) {
          // Remap the reply to match our schema
          cardInfo = providerDetails.map( body, self.nullValue );
          // if caching is on, provider request is only attempted if card details were not
          // in the cache now we have the details set it.
          if ( self.isCacheable( cardInfo ) ) {
            self.options.cache.set( iin, cardInfo );
          }

          // send the results back a-la-node
          callback( null, cardInfo );
        } else {
          if ( ++providerCount < providers.length ) {
            self.makeRequest( iin, providerCount, callback );
          } else {
            // Maybe one last attempt here with RegEx? If that does not work then error
            var patterns = require( '../configs/patterns' );

            // Set out null info object
            cardInfo = {
              iin: iin,
              brand: null,
              issuer: self.nullValue,
              type: self.nullValue,
              category: self.nullValue,
              country: self.nullValue
            };

            _.each( patterns, function( pattern ) {
              var regex = new RegExp( pattern.expression );
              if ( !cardInfo.brand && regex.test( iin ) ) {
                cardInfo.brand = self.brands[pattern.name];
              }
            } );

            // See if RegEx worked
            if ( cardInfo.brand && cardInfo.brand !== self.brands.UNKNOWN ) {
              callback( null, cardInfo );
            } else {
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
   * @param  {String} iin the number to check
   * @param  {Function} callback function to return the card details/error
   * @return {Object} returns the card details
   */
  iinChecker.prototype.lookup = function( iin, callback ) {
    try {
      var self = this;
      if ( _.isUndefined( iin ) ) {
        throw new TypeError( this.options.messages.PARAMETER_IIN_IS_UNDEFINED );
      } else {
        if ( _.isEmpty( iin ) ) {
          throw new TypeError( this.options.messages.PARAMETER_IIN_IS_EMPTY );
        } else {
          // convert input to string incase a int is passed in
          iin = String( iin );

          // First up. Make sure we are passing a number in.
          if ( _.isNaN( parseInt( iin, 10 ) ) ) {
            throw new TypeError( this.options.messages.PARAMETER_IIN_IS_NOT_A_NUMBER );
          }

          // Now make sure that we are passing in 6 characters
          if ( iin.length !== 6 ) {
            throw new TypeError( this.options.messages.PARAMETER_IIN_IS_NOT_LONG_ENOUGH );
          }

        }
      }
      if ( !_.isFunction( callback ) ) {
        throw new TypeError( this.options.messages.PARAMETER_CALLBACK_NOT_FUNCTION );
      }
      // if cache is turned on attempt to get card details from cache
      if ( self.options.cache ) {
        self.options.cache.get( iin )
        .then( function( data ) {
          // card details from cache
          callback( null, data );
        } )
        .catch( function() {
          // attempt to get from the providers if not in cache
          self.makeRequest( iin, 0, callback );
        } );
      } else {
        self.makeRequest( iin, 0, callback );
      }

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
