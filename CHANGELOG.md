# Changelog

## **0.1.9**
- [**#25**](https://github.com/Shortbreaks/iinChecker/issues/25) Switched the order of provider checking to get better API output

## **0.1.8**
- [**#19**](https://github.com/Shortbreaks/iinChecker/issues/19) Added in a fall back to RegEx if all providers fail
- [**#17**](https://github.com/Shortbreaks/iinChecker/issues/17) Updated travis file so coveralls doesn't fail
- Fixed the grammer on the tests
- Made test to the same style as the others
- [**#11**](https://github.com/Shortbreaks/iinChecker/issues/11) Fixed input string issue

## **0.1.7**
- [**#10**](https://github.com/Shortbreaks/iinChecker/issues/10) Fixed issues not getting caught
- Fixed bug with the provider loop overrunning the end of the array
- Extended test to give 100% code coverage

## **0.1.6**
- [**#5**](https://github.com/Shortbreaks/iinChecker/issues/5) Abstracted providers and schema mapping into config file

## **0.1.5**
- [**#6**](https://github.com/Shortbreaks/iinChecker/issues/6) Change output object to include iin instead of bin

## **0.1.4**
- Documentation all updated. Now shows clear use cases and examples

## **0.1.3**
- [**#3**](https://github.com/Shortbreaks/iinChecker/issues/3) Testing multiple, stubbed out providers
- Handled case where both providers are down it would silently error, Now error bubbles up

## **0.1.2**
- [**#1**](https://github.com/Shortbreaks/iinChecker/issues/1) Added in param checking on the lookup function

## **0.1.1**
- Name change from iinChecker to iin-checker as NPM does not support camelCase package names

## **0.1.0**
- Initial release