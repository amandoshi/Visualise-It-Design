let nodes;

function submitAdjacencyList() {
	// get edge list from main (input) text area
	let inputData = document.getElementById("inputList").value.split("\n");

	// check valid format
	let formatData;
	if (weighted) {
		formatData = formatCheckWeighted(inputData);
	} else {
		formatData = formatCheckUnweighted(inputData);
	}

	if (!formatData.validFormat) {
		showAlert(formatData.message, "error");
	} else {
		// create graph object
		let graph = new Graph(directed, weighted);
		graph.setGraph(formatData.adjacencyList, "adjacencyList");

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

function formatCheckWeighted(inputData) {
	let adjacencyListArr = new Array();

	for (let i = 0, n = Math.min(inputData.length, nodes.length); i < n; i++) {
		let nodeList = inputData[i].split(" ").filter((element) => element != "");

		// check for no connections
		if (!nodeList.length) {
			adjacencyListArr.push([]);
			continue;
		}

		// one node and one weight per connection - check for even number of items
		if (nodeList.length % 2 !== 0) {
			return {
				validFormat: false,
				message: "Error! Invalid node/weight formatting",
				adjacencyList: [],
			};
		}

		let nodeConnections = new Array();
		let nodesConnected = new Set();
		for (let j = 0; j < nodeList.length; j += 2) {
			let node = nodeList[j];
			let weight = nodeList[j + 1];

			// check valid node format
			if (!nodes.includes(node)) {
				return {
					validFormat: false,
					message: "Error! Invalid node name(s)",
					adjacencyList: [],
				};
			} else if (node == nodes[i]) {
				return {
					validFormat: false,
					message: "Error! Node cannot point to itself",
					adjacencyList: [],
				};
			} else if (nodesConnected.has(node)) {
				return {
					validFormat: false,
					message: "Error! Repeated connections",
					adjacencyList: [],
				};
			}

			nodesConnected.add(node);

			// check valid weight format
			if (
				weight.slice(-1) == "," &&
				isInteger(weight.substr(0, weight.length - 1))
			) {
				nodeConnections.push({
					node,
					weight: weight.substr(0, weight.length - 1),
				});
			} else if (j + 1 == nodeList.length - 1 && isInteger(weight)) {
				nodeConnections.push({ node, weight });
			} else {
				return {
					validFormat: false,
					message: "Error! Invalid node/weight formatting",
					adjacencyList: [],
				};
			}
		}

		// construct adjacency list array
		adjacencyListArr.push(nodeConnections);
	}

	// setup adjacency list
	let adjacencyList = new Object();
	for (let i = 0; i < nodes.length; i++) {
		if (i > adjacencyListArr.length - 1) {
			adjacencyList[nodes[i]] = [];
		} else {
			adjacencyList[nodes[i]] = adjacencyListArr[i];
		}
	}

	return {
		validFormat: true,
		message: "",
		adjacencyList,
	};
}

function formatCheckUnweighted(inputData) {
	let adjacencyListArr = new Array();

	for (let i = 0, n = Math.min(inputData.length, nodes.length); i < n; i++) {
		let nodeList = inputData[i].split(" ").filter((element) => element != "");

		// check for no connections
		if (!nodeList.length) {
			adjacencyListArr.push([]);
			continue;
		}

		let nodeConnections = new Set();
		for (const node of nodeList) {
			// check valid node format
			if (!nodes.includes(node)) {
				return {
					validFormat: false,
					message: "Error! Invalid node name(s)",
					adjacencyList: [],
				};
			} else if (node == nodes[i]) {
				return {
					validFormat: false,
					message: "Error! Node cannot point to itself",
					adjacencyList: [],
				};
			} else if (nodeConnections.has(node)) {
				return {
					validFormat: false,
					message: "Error! Repeated connections",
					adjacencyList: [],
				};
			}

			nodeConnections.add(node);
		}

		// construct adjacency list array
		adjacencyListArr.push(Array.from(nodeConnections));
	}

	// setup adjacency list
	let adjacencyList = new Object();
	for (let i = 0; i < nodes.length; i++) {
		if (i > adjacencyListArr.length - 1) {
			adjacencyList[nodes[i]] = [];
		} else {
			adjacencyList[nodes[i]] = adjacencyListArr[i];
		}
	}

	return {
		validFormat: true,
		message: "",
		adjacencyList,
	};
}

function isInteger(value) {
	return /^-?\d+$/.test(value);
}

function formatTextArea() {
	const maxColumns = 25;
	const nodeMaxLength = Math.max(...nodes.map((nodeName) => nodeName.length));

	let nodeList = document.getElementById("nodeList");
	let inputList = document.getElementById("inputList");

	nodeList.value = nodes.join("\n");
	inputList.value = "\n".repeat(nodes.length - 1);

	if (nodeMaxLength > maxColumns) {
		nodeList.classList.add("nodeListScroll");
		nodeList.setAttribute("wrap", "off");
	}

	nodeList.setAttribute("cols", Math.min(nodeMaxLength, maxColumns));
	nodeList.setAttribute("rows", nodes.length + 1);
	inputList.setAttribute("rows", nodes.length);
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
