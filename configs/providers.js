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
	}
]
