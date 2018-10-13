document.addEventListener('DOMContentLoaded', () => {
	const from = document.getElementById('from');
	const to = document.getElementById('to');

	M.Datepicker.init(to, {
		autoClose: true,
		format: 'dd.mm.yyyy',
		firstDay: 1
	});

	M.Datepicker.init(from, {
		autoClose: true,
		format: 'dd.mm.yyyy',
		firstDay: 1,
		onClose: () => {
			M.Datepicker.getInstance(to).open();
		}
	});
});

