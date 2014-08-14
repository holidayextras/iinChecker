# IIN Checker for payment cards

[![Built with Grunt](https://cdn.gruntjs.com/builtwith.png)](http://gruntjs.com/)

## About

Issuer identification number checker which returns details about a credit/debit and other payment cards

### Additional resources and links
- [Wikipedia: ISO/IEC 7812 Standard](http://en.wikipedia.org/wiki/ISO/IEC_7812)
- [Wikipedia: Rules arround bank cards numbers](http://en.wikipedia.org/wiki/Bank_card_number)
- [StackOverflow: RegEx for calculating brand](http://stackoverflow.com/questions/72768/how-do-you-detect-credit-card-type-based-on-number)

## Getting Started

If you want to work on this repo you will need to install the dependencies
```
$ npm install
```

#### EditorConfig

EditorConfig helps us define and maintain consistent coding styles between different editors and IDEs.  If you are using Sublime Editor you can install the `EditorConfig` using [Package Control](https://sublime.wbond.net).

For non Sublime development a bunch of other IDE plugins are available [here](http://editorconfig.org/#download)

## Documentation

Visit our [GitHub](https://github.com/Shortbreaks) website for all the things.

## Notes on coding style

Code is linted by ".jshintrc" and checked against the coding style guide "shortbreaks.jscs.json" when you run the default grunt task:
```
$ grunt
```

## Tests

Tests will run using the default grunt task but can also be called stand-alone using:
```
$ grunt test
```

## License
Copyright (c) 2014 Shortbreaks
Licensed under the MIT license.

## Todo (REMOVE BEFORE FINAL COMMIT)
- Change heading of this file. See [this](https://github.com/mikeal/request)
- Get working with providers and none provider RegEx alternative
- Allow preference of providers to be passed into options
- Support caching
- Write excellent docs

