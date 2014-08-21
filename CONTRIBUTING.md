# Submitting Issues

If you are submitting a bug, please provide code demonstrating the issue.

# Documentation

If you want to work on this repo you will need to install the dependencies
```
$ npm install
```

## EditorConfig

EditorConfig helps us define and maintain consistent coding styles between different editors and IDEs.  If you are using Sublime Editor you can install the `EditorConfig` using [Package Control](https://sublime.wbond.net).

For non Sublime development a bunch of other IDE plugins are available [here](http://editorconfig.org/#download)


## Notes on coding style

Code is linted by ".jshintrc" and checked against the coding style guide "shortbreaks.jscs.json" when you run the default grunt task:
```
$ grunt
```

## Tests

Linting and JSCS can be run using the default grunt task:
```
$ grunt
```

Tests will run automaticly for any pull request or commit thanks to Travis. If you want to run the test locally then call npm test:
```
$ npm test
```

