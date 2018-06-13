exports.limit = (array, limit) => array.slice(0, limit);

exports.sortByProp = (array, sortProp, sortDesc) =>
	array.sort((a, b) => {
		const order = (sortDesc) ? 1 : -1;

		if (a[sortProp] < b[sortProp]) return order;
		if (a[sortProp] > b[sortProp]) return order * -1;
		return 0;
	});

