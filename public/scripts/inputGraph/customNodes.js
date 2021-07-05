const MINNODES = 2;
const MAXNODES = 100;
let lineCount;
let weighted;
let directed;
let inputMethod;

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
	// get read-only text area as object
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

function formatCheck(nodes) {
	const validLength = 1;

	let uniqueNodes = new Set();
	for (const node of nodes) {
		const nodeName = node.split(" ").filter((element) => element != "");

		// check for 1 node name per line
		if (nodeName.length != validLength) {
			return {
				validFormat: false,
				message: "Error! Invalid node name formating",
				nodes: [],
			};
		} else {
			// construct set of unqiue node names
			uniqueNodes.add(nodeName[0]);
		}
	}

	// check for valid number of nodes
	if (uniqueNodes.size > MAXNODES) {
		return {
			validFormat: false,
			message: `Error! Max number of nodes: ${MAXNODES}`,
			nodes: [],
		};
	} else if (uniqueNodes.size < MINNODES) {
		return {
			validFormat: false,
			message: `Error! Min number of nodes: ${MINNODES}`,
			nodes: [],
		};
	}

	return {
		validFormat: true,
		message: "",
		nodes: uniqueNodes,
	};
}

function submitNodes() {
	// get node name list from main (input) text area
	let nodesArr = document.getElementById("inputList").value.split("\n");

	// format check node names
	const { validFormat, message, nodes } = formatCheck(nodesArr);

	if (!validFormat) {
		showAlert(message, "error");
	} else {
		// send data
		let data = {
			weighted,
			directed,
			nodes: Array.from(nodes).join(" "),
			inputMethod,
		};

		fetch("/input/custom/nodes", {
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

function setLines() {
	lineCount = 1;
	updateLineCount();
}
