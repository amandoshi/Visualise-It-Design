function submitGraphType() {
	// get form data
	let weighted = document.getElementById("weighted").checked;
	let directed = document.getElementById("directed").checked;
	let inputMethod = document.getElementById("inputMethod").value;

	// send data
	let data = { weighted, directed, inputMethod };
	fetch("/input/custom", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(data),
	})
		.then((res) => {
			return res.text();
		})
		.then((html) => {
			// load html
			document.open();
			document.write(html);
			document.close();
		});
}
