module.exports = [
	{ "name": "VISA", "expression": "^4[0-9]{5,}$" },
	{ "name": "MASTERCARD", "expression": "^5[1-5][0-9]{3,}$" },
	{ "name": "AMEX", "expression": "^3[47][0-9]{5,}$" },
	{ "name": "DISCOVER", "expression": "^6(?:011|5[0-9]{2})[0-9]{3,}$" },
	{ "name": "DINERS", "expression": "^3(?:0[0-5]|[68][0-9])[0-9]{4,}$" },
	{ "name": "JCB", "expression": "^(?:2131|1800|35[0-9]{3})[0-9]{3,}$" },
	{ "name": "MAESTRO", "expression": "^(5[06-8]|6\\d)\\d{10,17}$" },
	{ "name": "LASER", "expression": "^(6304|6706|6771|6709)\\d{8}(\\d{4}|\\d{6,7})?$" },
	{ "name": "UNKNOWN", "expression": ".*" }
]