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
	}
]
