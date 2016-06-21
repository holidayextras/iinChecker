'use strict';
( function() {
  // get some stuff we need to support IIN Checker
  var _ = require( 'lodash' );
  var request = require( 'request' );
  var EventEmitter = require( 'events' ).EventEmitter;

  var iinChecker = function( iinOptions ) {
    // Load all of our providers into an array that we can loop over.
    this.providers = require( '../configs/providers' );

    // default options
    this.options = {
      language: 'en',
      cache: false,
      timeout: 1000
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
      var self = this;
      // we don't have a cache
      if ( !self.options.cache ) {
        return false;
      }
      // we don't want to cache cards we don't know the brand for
      if ( !cardInfo.brand || cardInfo.brand === self.brands.UNKNOWN ) {
        return false;
      }

      // we don't want to cache cards we don't know the type of
      if ( !cardInfo.type || cardInfo.type === this.nullValue ) {
        return false;
      }

      // we can cache this card
      return true;
    };

    this.flipBrandWhereNecessary = function( cardInfo ) {
      var self = this;
      var firstNumber = parseInt( cardInfo.iin.charAt(0), 10 );
      if ( cardInfo.brand === self.brands.MASTERCARD && firstNumber === 4 ) {
        cardInfo.brand = self.brands.VISA;
      } else if ( cardInfo.brand === self.brands.VISA && firstNumber === 5 ) {
        cardInfo.brand = self.brands.MASTERCARD;
      }
      return cardInfo;
    };
  };

  // create a shorthand then export the IinChecker object for Nodejs
  exports = module.exports = iinChecker;

  /**
   * Lookup a card by its IIN and return a card object
   *
   * @param  {String} iin the number to check
   * @param  {Function} callback function to return the card details/error
   * @return {Boolean} returns true unless there is no callback supplied
   */
  iinChecker.prototype.lookup = function( iin, callback ) {
    var self = this;
    var emitter = new EventEmitter();

    function doRequest( iinToLookup, provider ) {
      var cardInfo;

      var _request = request( { url: provider.domain + provider.path + iinToLookup, json: true, timeout: self.options.timeout }, function( error, response, body ) {
        // the provider errored or our iin was bad
        if ( error || response.statusCode !== 200 ) {
          // fire off an event so we can handle the failed request
          emitter.emit( 'requestFailed', iinToLookup, _request );
          return false;
        }
        // Remap the reply to match our schema
        cardInfo = provider.map( body, self.nullValue );
        // we have some issues with binlist's correctness, some of their binranges
        // starting with 5 are being returned as VISA when they are actually MASTERCARD
        cardInfo = self.flipBrandWhereNecessary( cardInfo );
        // if caching is on, provider request is only attempted if card details were not
        // in the cache now we have the details set it.
        if ( self.isCacheable( cardInfo ) ) {
          self.options.cache.set( iinToLookup, cardInfo );
        }
        // fire off an event so we know that we have completed our request
        emitter.emit( 'requestComplete', cardInfo );
        return true;
      });

      // fire off an event so we know that the request has started
      emitter.emit( 'requestStarted', _request, iinToLookup );
    }

    // Loop through the providers and make a request to each of them
    function doLookup( providersToCheck, iinToCheck ) {
      providersToCheck.forEach( function( element ) {
        doRequest( iinToCheck, element );
      });
    }

    // Do a RegEx lookup on a iin
    function doRegex( iinToLookup ) {
      var cardInfo;
      var patterns = require( '../configs/patterns' );

      // Set out null info object
      cardInfo = {
        iin: iinToLookup,
        brand: self.nullValue,
        issuer: self.nullValue,
        type: self.nullValue,
        category: self.nullValue,
        country: self.nullValue
      };

      _.each( patterns, function( pattern ) {
        var regex = new RegExp( pattern.expression );
        if ( cardInfo.brand === self.nullValue && regex.test( iinToLookup ) ) {
          cardInfo.brand = self.brands[pattern.name];
        }
      } );

      // See if RegEx worked
      if ( cardInfo.brand && cardInfo.brand !== self.brands.UNKNOWN ) {
        // Our RegEx has work, so we fire off an event so we know about it
        emitter.emit( 'regexResult', cardInfo );
      } else {
        // The RegEx was unable to figure out what the card was so we will fire off an event so we know about it and deal with it
        emitter.emit( 'returnError', new TypeError(self.options.messages.PARAMETER_IIN_IS_INVALID), iinToLookup );
      }
    }

    // Bind our listeners here so we can handle events
    function bindListeners( listenerCallback ) {
      // we need to keep track of any requests we have
      var currentRequests = [];

      function stopListening() {
        emitter.removeAllListeners();
      }

      function clearRequestQueue() {
        _.invokeMap( currentRequests, 'abort' );
      }

      // listen to the "requestStarted" event - here we add requests into our "currentRequests" queue so we can keep track of them
      emitter.on( 'requestStarted', function( theRequest ) {
        // add this request to our queue
        currentRequests.push( theRequest );
      });

      // listen to the "requestComplete" event - the request has completed successfully if we have enough information
      // we can stop listening to any more events and call the callback with the resulting cardInfo
      emitter.on( 'requestComplete', function( cardInfo ) {
        // is this the event we're interested in?...
        if ( cardInfo.iin === iin ) {
          // ...yes, do we have what we need?...
          if ( cardInfo.brand && cardInfo.brand !== self.brands.UNKNOWN ) {
            //...yes we do! So we can stop listening to events
            stopListening();
            // we also don't care about any other requests that may be running
            clearRequestQueue();
            // finally fire off the callback with the card details
            listenerCallback( null, cardInfo );
            return true;
          }
        }
        return true;
      });

      // listen to the "requestFailed" event - our request failed, so either the iin we have is bad or the provider is unavailable
      emitter.on( 'requestFailed', function( iinToLookup, theRequest ) {
        // make sure we are listening to a relevant event
        if ( iinToLookup === iin ) {
          // ok, our request failed we should remove it from the "currentRequests" queue
          var index = currentRequests.indexOf( theRequest );
          if ( index > -1 ) {
            currentRequests.splice( index, 1 );
          }
          // if we have no requests the the queue then we should do a RegEx lookup as a last resort
          if ( currentRequests.length === 0 ) {
            doRegex( iin );
          }
        }
      });

      // listen to the "regexResult" event - we have a result from
      emitter.on( 'regexResult', function( cardInfo ) {
        if ( cardInfo.iin === iin ) {
          // we don't want to worry about any more events
          stopListening();
          // now clean up any requests so we're not waiting around
          clearRequestQueue();
          // everything else has failed and we're left with the RegEx result - let's just send that back
          return listenerCallback( null, cardInfo );
        }
        return true;
      });

      emitter.on( 'returnError', function( error, iinToLookup ) {
        if ( iinToLookup === iin ) {
          // we don't want to worry about any more events
          stopListening();
          clearRequestQueue();
          // if we've made it here then we can only return and error
          return listenerCallback( error );
        }
        return true;
      });
    }

    try {
      if ( _.isUndefined( iin ) ) {
        throw new TypeError( this.options.messages.PARAMETER_IIN_IS_UNDEFINED );
      } else {
        if ( _.isEmpty( iin ) ) {
          throw new TypeError( this.options.messages.PARAMETER_IIN_IS_EMPTY );
        } else {
          // convert input to string in case a int is passed in
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

      bindListeners( callback );

      // if cache is turned on attempt to get card details from cache
      if ( self.options.cache ) {
        self.options.cache.get( iin )
        .then( function( data ) {
          // card details from cache
          callback( null, data );
          return true;
        } )
        .catch( function() {
          // attempt to get from the providers if not in cache
          doLookup( self.providers, iin );
        } );
      } else {
        // we are not using the cache, so do a lookup
        doLookup( self.providers, iin );
      }
    } catch ( err ) {
      // Return the err in the error callback, if not possible return it.
      if ( callback ) {
        callback( err );
        return false;
      }
      return err;
    }
    return true;
  };
} )();
