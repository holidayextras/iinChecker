var _ = require( "lodash" );

module.exports = [
	{
		name: "BINLIST",
		domain: "http://www.binlist.net",
		path: "/json/",
		map: function( returnedData, nullValue ) {
			return {
				iin: returnedData.bin,
				brand: returnedData.brand,
				issuer: returnedData.bank,
				type: returnedData.card_type,
				category: returnedData.card_category,
				country: returnedData.country_code
			}
		}
	},
	{
		name: "RIBBON",
		domain: "https://bins.ribbon.co",
		path: "/api/v1/bins/",
		map: function( returnedData, nullValue ) {
			return {
				iin: returnedData.bin,
				brand: returnedData.brand,
				issuer: returnedData.issuer,
				type: ( returnedData.type ? returnedData.type : nullValue ),
				category: nullValue,
				country: returnedData.country_code
			}
		}
	},
	{
		name: "REGEX",
		get: function( iin, callback ) {

			var patterns = require( "./pattern" );
			var matched = { "name" : null };

			_.each( patterns, function( provider ) {
				var regex = new RegExp( provider.pattern );
				if( !matched.name && regex.test( iin ) ) {
					matched.name = provider.name;
				}
			} );

			var error = null;
			var response = { statusCode : ( matched.name === 'UNKNOWN' ? 404 : 200 ) };
			var body = {
				iin: iin,
				brand: matched.name
			};

			callback( error, response, body );
		},
		map: function( returnedData, nullValue ) {
			return {
				iin: returnedData.iin,
				brand: returnedData.brand,
				issuer: nullValue,
				category: nullValue,
				country: nullValue
			}
		}
	}
]
