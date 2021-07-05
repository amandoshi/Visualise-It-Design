// load dependencies
let cytoscape = require("cytoscape");
let fcose = require("cytoscape-fcose");

// pass fcose middleware through cytoscape
cytoscape.use(fcose);

// global variables
let cy;

function visualiseGraph(graph) {
	const colors = {
		defaultEdge: "#ddd",
		hover: "#a81697",
		start: "#00a116",
		target: "#db0021",
		visitedNode: "#026299",
		visitedEdge: "#56a0db",
		pathNode: "#f2c00a",
		pathEdge: "#ed9434",
	};

	const nodeStyle = {
		width: 10,
		height: 10,
		"border-width": 1,
	};

	let edgeStyle = elementStyle(
		colors.defaultEdge,
		false,
		true,
		graph.directed,
		0
	);

	edgeStyle.width = 1;
	edgeStyle["curve-style"] = "bezier";

	if (graph.directed) {
		edgeStyle["arrow-scale"] = 0.6;
		edgeStyle["target-arrow-shape"] = "triangle";
	}

	cy = cytoscape({
		container: document.getElementById("graphCanvas"),

		boxSelectionEnabled: false,
		autounselectify: true,

		style: cytoscape
			.stylesheet()
			.selector("node")
			.style(nodeStyle)
			.selector("edge")
			.style(edgeStyle)
			.selector(".highlighted")
			.style(elementStyle(colors.hover, true, true, graph.directed, 0))
			.selector(".start")
			.style(elementStyle(colors.start, true, false, graph.directed, 0.5))
			.selector(".target")
			.style(elementStyle(colors.target, true, false, graph.directed, 0.5))
			.selector(".visitedNode")
			.style(elementStyle(colors.visitedNode, true, false, graph.directed, 0.5))
			.selector(".visitedEdge")
			.style(elementStyle(colors.visitedEdge, false, true, graph.directed, 0.5))
			.selector(".finalPathNode")
			.style(elementStyle(colors.pathNode, true, false, graph.directed, 0.5))
			.selector(".finalPathEdge")
			.style(elementStyle(colors.pathEdge, false, true, graph.directed, 0.5)),

		elements: {
			nodes: graph.getCyNodes(),
			edges: graph.getCyEdges(),
		},

		layout: {
			name: "fcose",
			directed: graph.directed,
			padding: 10,
		},
	});

	return new Promise((resolve, reject) => {
		resolve();
	});
}

function elementStyle(color, isNode, isEdge, isDirected, transitionDuration) {
	let style = new Object();
	let elements = new Array();

	if (isNode) {
		style["background-color"] = color;
		elements.push("background-color");
	}
	if (isEdge) {
		if (!isDirected) {
			style["source-arrow-color"] = color;
			elements.push("line-color", "target-arrow-color");
		}

		style["line-color"] = color;
		style["target-arrow-color"] = color;

		elements.push("line-color", "target-arrow-color");
	}
	if (transitionDuration) {
		style["transition-duration"] = `${transitionDuration}s`;
		style["transition-property"] = elements.join(",");
	}

	return style;
}

function setupHighlightedElements() {
	cy.on("mouseover", (event) => {
		let targetEvent = event.target;

		// check if event is from cytoscape element (node, edge)
		if (targetEvent !== cy) {
			// get data of element
			let data;
			if (targetEvent.group() == "nodes") {
				if (targetEvent.data().startNode) {
					cy.$(`#${targetEvent.id()}`).removeClass("start");
				} else if (targetEvent.data().targetNode) {
					cy.$(`#${targetEvent.id()}`).removeClass("target");
				} else if (targetEvent.data().finalPath) {
					cy.$(`#${targetEvent.id()}`).removeClass("finalPathNode");
				} else if (targetEvent.data().visited) {
					cy.$(`#${targetEvent.id()}`).removeClass("visitedNode");
				}

				data = `type: node; id: ${targetEvent.id()}`;
			} else {
				if (targetEvent.data().finalPath) {
					cy.$(`#${targetEvent.id()}`).removeClass("finalPathEdge");
				} else if (targetEvent.data().visited) {
					cy.$(`#${targetEvent.id()}`).removeClass("visitedEdge");
				}

				data = `type: edge; connection: ${targetEvent.id()}; weight: ${
					targetEvent.data().weight
				}`;
			}

			// update graph information displayed
			document.getElementById("graphInfo").innerHTML = data;

			// highlight element
			cy.$(`#${targetEvent.id()}`).addClass("highlighted");
		}
	});

	cy.on("mouseout", (event) => {
		let targetEvent = event.target;
		if (targetEvent !== cy) {
			// reset graph information displayed
			document.getElementById("graphInfo").innerHTML = "";

			if (targetEvent.group() == "nodes") {
				if (targetEvent.data().targetNode) {
					cy.$(`#${targetEvent.id()}`).addClass("target");
				} else if (targetEvent.data().startNode) {
					cy.$(`#${targetEvent.id()}`).addClass("start");
				} else if (targetEvent.data().finalPath) {
					cy.$(`#${targetEvent.id()}`).addClass("finalPathNode");
				} else if (targetEvent.data().visited) {
					cy.$(`#${targetEvent.id()}`).addClass("visitedNode");
				}
			} else {
				if (targetEvent.data().finalPath) {
					cy.$(`#${targetEvent.id()}`).addClass("finalPathEdge");
				} else if (targetEvent.data().visited) {
					cy.$(`#${targetEvent.id()}`).addClass("visitedEdge");
				}
			}

			// de-highlight element
			cy.$(`#${targetEvent.id()}`).removeClass("highlighted");
		}
	});
}

function runTraversal(traversal) {
	cy.$(`#${traversal.startNode}`).addClass("start");
	cy.$(`#${traversal.targetNode}`).addClass("target");

	cy.$(`#${traversal.startNode}`).data().startNode = true;
	cy.$(`#${traversal.targetNode}`).data().targetNode = true;

	let iterateTraversal = setInterval(() => {
		let traversalData = traversal.next();

		console.log(traversalData);

		if (traversalData.success) {
			traversalData = traversalData.value;
		} else {
			clearInterval(iterateTraversal);
			return;
		}

		let edge = cy.$(`#${traversalData.edge}`);
		let node = cy.$(`#${traversalData.node}`);

		edge.addClass("visitedEdge");
		if (traversalData.node != traversal.targetNode) {
			node.addClass("visitedNode");
		}

		edge.data().visited = true;
		node.data().visited = true;

		// next iteration
		if (traversal.targetFound || traversalData == undefined) {
			clearInterval(iterateTraversal);
			loadFinalPath(traversal);
		}
	}, 100);
}

function loadFinalPath(bfs) {
	let path = bfs.finalPath();
	let nodes = bfs.graph.nodes;
	let directed = bfs.graph.directed;

	let counter = 0;
	let displayPath = setInterval(() => {
		let node = cy.$(`#${path[counter + 1]}`);
		let edge = cy.$(`#${bfs.connection(path[counter], path[counter + 1])}`);

		// let edge;
		// if (!directed) {
		// 	// ADD CODE HERE PLS
		// 	let tempEdge = [
		// 		bfs.graph.nodes.indexOf(path[counter]),
		// 		bfs.graph.nodes.indexOf(path[counter + 1]),
		// 	].sort();
		// 	edge = cy.$(
		// 		`#${bfs.graph.nodes[tempEdge[0]]}-${bfs.graph.nodes[tempEdge[1]]}`
		// 	);
		// } else {
		// 	edge = cy.$(`#${path[counter]}-${path[counter + 1]}`);
		// }

		edge.removeClass("visitedEdge");
		edge.addClass("finalPathEdge");

		node.data().finalPath = true;
		edge.data().finalPath = true;

		counter++;
		if (counter === path.length - 1) {
			clearInterval(displayPath);
		} else {
			node.removeClass("visitedNode");
			node.addClass("finalPathNode");
		}
	}, 1000);
}

// export visualise graph function
window.visualiseGraph = visualiseGraph;
window.setupHighlightedElements = setupHighlightedElements;
window.runTraversal = runTraversal;
