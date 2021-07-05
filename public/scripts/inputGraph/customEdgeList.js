const MAXEDGES = 100;

function checkLineCount(object) {
	// get current line count
	let tempLineCount = countLines(object.value);

	// check if line count changed
	if (lineCount != tempLineCount) {
		lineCount = tempLineCount;
		updateLineCount();
	}
}

function countLines(txt) {
	if (txt == "") {
		return 1;
	} else {
		return txt.split("\n").length;
	}
}

function updateLineCount() {
	// get read-only text area
	let objRowCount = document.getElementById("rowNum");

	// generate line numbers
	let rowString = "";
	for (let i = 1; i < lineCount + 1; i++) {
		rowString += i.toString() + "\n";
	}

	// add line numbers to read-only text area
	objRowCount.value = rowString;
}

function syncScroll() {
	// get both text areas as objects
	objRowCount = document.getElementById("rowNum");
	objInputList = document.getElementById("inputList");

	// sync scrolls for text areas
	objRowCount.scrollTop = objInputList.scrollTop;
}

function formatCheck(edges) {
	//determine valid length of edge connection
	const validLength = weighted ? 3 : 2;

	// check for too many edges
	if (edges.length > MAXEDGES) {
		return {
			validFormat: false,
			message: `Error! Max number of edges: ${MAXEDGES}`,
			edgeList: [],
		};
	}

	let edgeList = Array();
	for (const edge of edges) {
		let edgeData = edge.split(" ").filter((element) => element != "");

		// check for valid edge formatting
		if (
			edgeData.length != validLength ||
			edgeData[0] == edgeData[1] ||
			(weighted && (!isInteger(edgeData[2]) || edgeData[2] == 0))
		) {
			return {
				validFormat: false,
				message: "Error! Invalid edge formating",
				edgeList: [],
			};
		} else {
			// construct edge list
			edgeList.push(edgeData);
		}
	}

	return {
		validFormat: true,
		message: "",
		edgeList: edgeList,
	};
}

function submitEdgeList() {
	// get edge list from main (input) text area
	let edges = document.getElementById("inputList").value.split("\n");

	// format check edges
	const { validFormat, message, edgeList } = formatCheck(edges);

	if (!validFormat) {
		showAlert(message, "error");
	} else {
		// create a graph object
		let graph = new Graph(directed, weighted);
		graph.setGraph(edgeList, "edgeList");

		// get graph properties
		let matrix = graph.graph;
		let nodes = graph.nodes;
		let negative = graph.negative;

		let data = { weighted, directed, matrix, nodes, negative };

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

function isInteger(value) {
	return /^-?\d+$/.test(value);
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
