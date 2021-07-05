let nodes;

function submitMatrix() {
	const { validFormat, message, matrix } = formatCheck();
	if (!validFormat) {
		showAlert(message, "error");
	} else {
		let graph = new Graph(directed, weighted);
		graph.setGraph(matrix, "adjacencyMatrix");

		let data = {
			weighted,
			directed,
			matrix,
			nodes,
			negative: graph.negative,
		};

		// send data
		fetch("/input/custom/uploadGraph", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(data),
		})
			.then((res) => {
				return res.text();
			})
			.then((redirect) => {
				// redirect to visualise graph page
				window.location.href = JSON.parse(redirect).url;
			});
	}
}

function formatCheck() {
	let size = nodes.length;

	// setup emtpy matrix
	let matrix = emptyMatrix(size);

	for (let i = 0; i < size; i++) {
		for (let j = 0; j < size; j++) {
			let weight = document.getElementById(`${i}-${j}`).value;
			if (!weight) {
				weight = 0;
			}

			// check valid number
			if (!isInteger(weight)) {
				return {
					validFormat: false,
					message: "Error! Weights must be integers",
					matrix: [],
				};
			} else if (weight === "0") {
				return {
					validFormat: false,
					message: "Error! Weights cannot be 0",
					matrix: [],
				};
			} else if (!weighted && weight > 1) {
				return {
					validFormat: false,
					message: "Error! Unweighted graph must have weights of value 1",
					matrix: [],
				};
			}

			// set edge connection
			matrix[i][j] = parseInt(weight);
		}
	}

	return {
		validFormat: true,
		message: "",
		matrix,
	};
}

function emptyMatrix(size) {
	let matrix = new Array(size);
	for (let i = 0; i < size; i++) {
		let subArr = new Array(size);
		subArr.fill(0);
		matrix[i] = subArr;
	}
	return matrix;
}

function isInteger(value) {
	return /^-?\d+$/.test(value);
}

function setupMatrixHead() {
	let tableHeadString = "<tr><th></th>";

	for (const node of nodes) {
		tableHeadString += `<th>${node}</th>`;
	}

	tableHeadString += "</tr>";

	return tableHeadString;
}

function setupMatrixBody() {
	let tableBodyString = "";

	for (let i = 0, size = nodes.length; i < size; i++) {
		let tableRowString = `<tr><th>${nodes[i]}</th>`;

		for (let j = 0; j < size; j++) {
			let readonly = i == j ? "readonly" : "";
			// construct input string

			let inputString = `<input id="${i}-${j}" placeholder="0" type="number" `;
			if (i == j) {
				inputString += `class="selfEdge" readonly`;
			} else if (!directed && i > j) {
				inputString += `class="copiedEdge" readonly`;
			} else {
				if (!directed) {
					inputString += `oninput="updateInputCellText(this.id)" `;
				}

				inputString += `class="activeEdge"`;
			}
			inputString += ">";

			tableRowString += `<td>${inputString}</td>`;
		}

		tableBodyString += tableRowString;
	}

	return tableBodyString;
}

function updateInputCellText(id) {
	let number = document.getElementById(id).value;
	let reversedId = id.split("-").reverse().join("-");
	document.getElementById(reversedId).value = number;
}

function setupMatrix() {
	let inputHtmlString = "";
	inputHtmlString += setupMatrixHead();
	inputHtmlString += setupMatrixBody();

	document.getElementById("matrixInput").innerHTML = inputHtmlString;
}

function showAlert(message, type) {
	alert = document.getElementById("alert");
	alert.classList.remove("hide");
	alert.classList.add("show");

	if (type == "error") {
		alert.classList.add("error");
	}

	alertMessage = document.getElementById("alertMessage");
	alertMessage.innerHTML = message;
}

function hideAlert() {
	alert = document.getElementById("alert");
	alert.classList.remove("show");
	alert.classList.add("hide");
}

function setupAlert() {
	document.getElementById("close-button").onclick = hideAlert;
}
