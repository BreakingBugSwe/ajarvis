/* eslint-env browser, jquery */

$(document).ready(() => {
	$('.clickable-row').click(function () {
		window.location = $(this).data('href');
	});
});
