function upload(url = '', data = {}) {
	const formData = new FormData();

	for (let name in data)
		formData.append(name, data[name]);

	return fetch(url, {
		method: 'POST',
		mode: 'same-origin',
		body: formData
	});
}

export { upload };