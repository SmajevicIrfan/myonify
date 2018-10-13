import '../css/main.scss';
import './datepicker';
import { upload } from './upload';

const submitBtn = document.getElementById('submit');

const dataCSV = document.getElementsByName('dataCSV')[0];
const leftLogo = document.getElementsByName('leftLogo')[0];
const rightLogo = document.getElementsByName('rightLogo')[0];
const from = document.getElementsByName('from')[0];
const to = document.getElementsByName('to')[0];
const signature_title = document.getElementsByName('signature_title')[0];
const signature = document.getElementsByName('signature')[0];

submitBtn.addEventListener('click', (e) => {
	e.preventDefault();

	const body = {
		dataCSV: dataCSV.files[0],
		leftLogo: leftLogo.files[0],
		rightLogo: rightLogo.files[0],
		from: from.value,
		to: to.value,
		signature_title: signature_title.value,
		signature: signature.value
	};

	upload('/api/upload', body)
		.then(res => res.text())
		.then(reportId => {
			window.open(`/api/download?id=${reportId}`);
		});
});
