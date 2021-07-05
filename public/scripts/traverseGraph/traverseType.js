function populateNodes() {
	let nodeSelectHTML =
		"<option disabled selected value>--Choose target node--</option>";

	// test code
	console.log(graphData.nodes.sort());
	graphData.nodes.sort().forEach((node) => {
		nodeSelectHTML += `<option value="${node}">${node}</option>`;
	});

	document.getElementById("startNode").innerHTML = nodeSelectHTML;
	document.getElementById("targetNode").innerHTML = nodeSelectHTML;
}

function submitTraversalType() {
	// get form data
	let startNodeIndex = graphData.nodes.indexOf(
		document.getElementById("startNode").value
	);
	let targetNodeIndex = graphData.nodes.indexOf(
		document.getElementById("targetNode").value
	);
	let traversalType = document.getElementById("traverseType").value;

	if (!(graphData.weighted || ["bfs", "dfs"].includes(traversalType))) {
		// reject unweighted graph and weighted algorithm
		showAlert(
			"Error! Weighted algorithm cannot be used on unweighted graph",
			"error"
		);
	} else if (graphData.weighted && ["bfs", "dfs"].includes(traversalType)) {
		// reject weighted graph and unweighted algorithm
		showAlert(
			"Error! Unweighted algorithm cannot be used on weighted graph",
			"error"
		);
	} else if (
		graphData.negative &&
		!["bellmandFord", "floydWarshall"].includes(traversalType)
	) {
		// reject negative-weighted edge
		showAlert(
			"Error! This traversal algorithm cannot be used with negative-weighted edges",
			"error"
		);
	} else if (startNodeIndex == targetNodeIndex) {
		showAlert("Error! Start node cannot equal target node", "error");
	} else {
		// send data
		let data = { startNodeIndex, targetNodeIndex, traversalType };

		// send data
		fetch("/traverse/type", {
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
