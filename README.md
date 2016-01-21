# IIN Checker for payment cards
[![Circle CI](https://circleci.com/gh/holidayextras/iinChecker/tree/master.svg?style=svg&circle-token=af8da07bbe8bddd209990d0f9f0c0a2f39db99df)](https://circleci.com/gh/holidayextras/iinChecker)
[![Dependency status](https://david-dm.org/holidayextras/iinChecker/status.png)](https://david-dm.org/holidayextras/iinChecker#info=dependencies&view=table)
[![Dev Dependency Status](https://david-dm.org/holidayextras/iinChecker/dev-status.png)](https://david-dm.org/holidayextras/iinChecker#info=devDependencies&view=table)

[![NPM](https://nodei.co/npm/iin-checker.png)](https://nodei.co/npm/iin-checker/)

## About

Issuer identification number checker which returns details about a credit/debit and other payment cards

### Additional resources and links
- [Wikipedia: ISO/IEC 7812 Standard](http://en.wikipedia.org/wiki/ISO/IEC_7812)
- [Wikipedia: Rules arround bank cards numbers](http://en.wikipedia.org/wiki/Bank_card_number)
- [StackOverflow: RegEx for calculating brand](http://stackoverflow.com/questions/72768/how-do-you-detect-credit-card-type-based-on-number)
- [Another NPM Card Module](https://github.com/observing/creditcard)

## Installation

The module is available in the NPM registery. It can be installed using the
`npm` commandline utlity.

```
npm install iin-checker
```

Once you have installed the module you can simply require inside of your Node.js
application and use it's exported methods. Here is a simple example of that which gets the card details back as an object:

```js
var IinChecker = require( 'iin-checker' );
// Initialise with default options no caching
var iin = new IinChecker( {} );

// Initialise with caching
var iin = new IinChecker( {
    cache: {
      set: function( iin, cardDetails ) {...},
      get: function( iin ) {..}
    }
} );



iin.lookup( '543210', function( err, result ) {
  if ( err ) {
    console.log( 'Error:', err );
  } else {
    console.log( 'Result:', result );
  }
} );
```
### Caching
Caching is turned off by default.
It can be turned on by passing in options a cache object with your functions to set and get the cache'.


### Card Type Detection

If you want to test to see if the card is a Credit or Debit card you can can achive this in the following way:

```js
var IinChecker = require( 'iin-checker' );
var iin = new IinChecker( {} );

iin.lookup( '543210', function( err, result ) {
  if ( err ) {
    console.log( 'Error:', err );
  } else {
    var isDebit = ( result.type === iin.types.DEBIT )
    console.log( 'Debit?:', isDebit );
  }
} );
```

Possible values for _iin.types_ are **DEBIT**, **CREDIT** and **UNKNOWN**.

### Card Brand Detection

If you want to test to see which brand the card is, you can can achive this in the following way:

```js
var IinChecker = require( 'iin-checker' );
var iin = new IinChecker( {} );

iin.lookup( '543210', function( err, result ) {
  if ( err ) {
    console.log( 'Error:', err );
  } else {
    var isMastercard = ( result.brand === iin.brands.MASTERCARD )
    console.log( 'Mastercard?:', isMastercard );
  }
} );
```

Possible values for _iin.brands_ are **VISA**, **MASTERCARD**, **AMEX**, **DISCOVER**, **JCB**, **MAESTRO** and **LASER**. In future more card brands will be supported, if you need a brand adding please raise an issue.

## [Changelog](CHANGELOG.md)

## [Contributing](CONTRIBUTING.md)


## License
Copyright (c) 2014 Shortbreaks
Licensed under the MIT license.

## Todo
- Get non-provider RegEx alternative
- Read providers from configs (as the tests do)
- Allow preference of providers to be passed into options
- Support caching

