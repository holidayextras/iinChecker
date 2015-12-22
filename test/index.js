'use strict';

// var should;
// should = require( 'chai' ).should();
var chai = require( 'chai' );
var expect = chai.expect;
var IinChecker = require( '../index' );
var iin = new IinChecker( {} );
var nock = require( 'nock' );
var path = require( 'path' );

// RegEx Constant
var REGEX = 'REGEX';

describe( '#pass in invalid params', function() {
  it( 'lookup a card with undefined iin and error gracefully', function() {
    iin.lookup( undefined, function( err ) {
      expect( err ).to.be.an.instanceof( TypeError );
      expect( err.message ).to.be.equal( iin.options.messages.PARAMETER_IIN_IS_UNDEFINED );
    } );
  } );
  it( 'should lookup a card with empty iin and error gracefully', function() {
    iin.lookup( '', function( err) {
      expect( err ).to.be.an.instanceof( TypeError );
      expect( err.message ).to.be.equal( iin.options.messages.PARAMETER_IIN_IS_EMPTY );
    } );
  } );
  it( 'should lookup a card with undefined callback and error gracefully', function() {
    var result = iin.lookup( '411111' );
    expect( result.message ).to.be.equal( iin.options.messages.PARAMETER_CALLBACK_NOT_FUNCTION );
  } );
  it( 'should return an error of not a number', function() {
    iin.lookup( 'foobar', function( err ) {
      expect( err ).to.be.an.instanceof( TypeError );
      expect( err.message ).to.be.equal( iin.options.messages.PARAMETER_IIN_IS_NOT_A_NUMBER );
    } );
  } );
  it( 'should return an error of not long enough', function() {
    iin.lookup( '123', function( err ) {
      expect( err ).to.be.an.instanceof( TypeError );
      expect( err.message ).to.be.equal( iin.options.messages.PARAMETER_IIN_IS_NOT_LONG_ENOUGH );
    } );
  } );
} );

// Load all of our providers into an array that we can loop over.
var providers = require( '../configs/providers' );

var stubRequest = function( provider, requestedIin ) {
  // Don't stub our network requests if our provider is RegEx as it is not a network request
  if ( provider.name !== REGEX ) {
    // Make sure our string comparisons don't get caught out by case issues by converting to uppercase
    if ( requestedIin !== '111111' ) {
      nock( provider.domain ).get( provider.path + requestedIin ).replyWithFile( 200, path.join( __dirname, 'fixtures', provider.name, requestedIin ) + '.json' );
    } else {
      nock( provider.domain ).get( provider.path + requestedIin ).reply( 404, '404 page not found' );
    }
  }
};

// This will stop all further calls to this provider from functioning...Please make sure you call this on the last line of your last test function
var breakProvider = function( provider ) {
  nock( provider.domain ).persist().get( '*' ).reply( 500 );
};

// Out repeatable tests
var commonTests = function( provider ) {
  describe( '#lookup a card using ' + provider.name, function() {
    var testGenCard;
    it( 'should lookup a card without error', function( done ) {
      var iinToLookup = '411111';
      stubRequest( provider, iinToLookup );
      iin.lookup( iinToLookup, function( err, result ) {
        if ( err ) {
          throw ( err );
        } else {
          testGenCard = result;
          done();
        }
      } );
    } );

    it( 'iin lookup returns card as an object', function() {
      expect( testGenCard ).to.be.an( 'object' );
    } );

    it( 'card object returned contains the correct properties', function() {
      expect( testGenCard ).to.have.property( 'iin' );
      expect( testGenCard ).to.have.property( 'brand' );
      expect( testGenCard ).to.have.property( 'issuer' );
      expect( testGenCard ).to.have.property( 'type' );
      expect( testGenCard ).to.have.property( 'category' );
      expect( testGenCard ).to.have.property( 'country' );
    } );

    it( 'should lookup an invalid card and error gracefully', function( done ) {
      var iinToLookup = '111111';
      stubRequest( provider, iinToLookup );
      iin.lookup( iinToLookup, function( err ) {
        expect( err ).to.not.equal( null );
        expect( err ).to.not.equal( undefined );
        done();
      } );
    } );
  } );

  describe( '#lookup visa debit using ' + provider.name, function() {
    var testVisaDebitCard;
    it( 'should lookup a card without error', function( done ) {
      var iinToLookup = '431940';
      stubRequest( provider, iinToLookup );
      iin.lookup( iinToLookup, function( err, result ) {
        if ( err ) {
          throw ( err );
        } else {
          testVisaDebitCard = result;
          done();
        }
      } );
    } );

    // Alter test depending on if it is RegEx of a Provider Test
    if ( provider.name === REGEX ) {
      it( 'card is of type unknown', function() {
        expect( testVisaDebitCard.type ).to.equal( iin.types.UNKNOWN );
      } );
    } else {
      it( 'card is of type debit', function() {
        expect( testVisaDebitCard.type ).to.equal( iin.types.DEBIT );
      } );
    }

    it( 'card is of brand visa', function() {
      expect( testVisaDebitCard.brand ).to.equal( iin.brands.VISA );
    } );
  } );

  describe( '#lookup mastercard credit using ' + provider.name, function() {
    var testMasterCreditCard;
    it( 'should lookup a card without error', function( done ) {
      var iinToLookup = '518791';
      stubRequest( provider, iinToLookup );
      iin.lookup( iinToLookup, function( err, result ) {
        if ( err ) {
          throw ( err );
        } else {
          testMasterCreditCard = result;
          done();
        }
      } );
    } );

    // Alter test depending on if it is RegEx of a Provider Test
    if ( provider.name === REGEX ) {
      it( 'card is of type unknown', function() {
        expect( testMasterCreditCard.type ).to.equal( iin.types.UNKNOWN );
      } );
    } else {
      it( 'card is of type credit', function() {
        expect( testMasterCreditCard.type ).to.equal( iin.types.CREDIT );
      } );
    }

    it( 'card is of brand mastercard', function() {
      expect( testMasterCreditCard.brand ).to.equal( iin.brands.MASTERCARD );
    } );
  } );
};

// Lets read our providers in from the config and loop over them
providers.forEach( function( provider ) {
  commonTests( provider );
  // This is the final test...we are all done with the provider, so let's mock them being broken, so that fallback will work for the subsequent provider
  breakProvider( provider );
} );

// Because we have looped all providers and called 'breakProvider' on each we should be OK to test the RegEx version here.
commonTests( { name: REGEX } );
