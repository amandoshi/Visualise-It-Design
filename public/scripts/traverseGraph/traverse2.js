// load dependencies
let cytoscape = require("cytoscape");
let fcose = require("cytoscape-fcose");

// pass fcose middleware through cytoscape
cytoscape.use(fcose);

// global variables
let cy;

function visualiseGraph(graph) {
	let defaultColor = "#ddd";
	let highlightedColor = "#a81697";

	let startColor = "#00a116";
	let targetColor = "#db0021";

	let visitedColorNode = "#026299";
	let visitedColorEdge = "#56a0db";

	let finalPathColorNode = "#f2c00a";
	let finalPathColorEdge = "#ed9434";

	let edgeStyle = {
		"curve-style": "bezier",
		"target-arrow-shape": "triangle",
		width: 1,
		"line-color": defaultColor,
		"target-arrow-color": defaultColor,
	};

	let highlightedStyle = {
		"background-color": highlightedColor,
		"line-color": highlightedColor,
		"target-arrow-color": highlightedColor,
		"transition-property": "background-color, line-color, target-arrow-color",
	};

	let startStyle = {
		"background-color": startColor,
		"line-color": startColor,
		"target-arrow-color": startColor,
		"transition-property": "background-color, line-color, target-arrow-color",
		"transition-duration": "0.3s",
	};

	let targetStyle = {
		"background-color": targetColor,
		"line-color": targetColor,
		"target-arrow-color": targetColor,
		"transition-property": "background-color, line-color, target-arrow-color",
		"transition-duration": "0.3s",
	};

	let visitedStyleNode = {
		"background-color": visitedColorNode,
		"line-color": visitedColorNode,
		"target-arrow-color": visitedColorNode,
		"transition-property": "background-color, line-color, target-arrow-color",
		"transition-duration": "0.5s",
	};

	let visitedStyleEdge = {
		"background-color": visitedColorEdge,
		"line-color": visitedColorEdge,
		"target-arrow-color": visitedColorEdge,
		"transition-property": "background-color, line-color, target-arrow-color",
		"transition-duration": "0.5s",
	};

	let finalPathStyleNode = {
		"background-color": finalPathColorNode,
		"line-color": finalPathColorNode,
		"target-arrow-color": finalPathColorNode,
		"transition-property": "background-color, line-color, target-arrow-color",
		"transition-duration": "0.5s",
	};

	let finalPathStyleEdge = {
		"background-color": finalPathColorEdge,
		"line-color": finalPathColorEdge,
		"target-arrow-color": finalPathColorEdge,
		"transition-property": "background-color, line-color, target-arrow-color",
		"transition-duration": "0.5s",
	};

	// let explored = {}

	// check for non-directed graph
	if (!graph.directed) {
		edgeStyle["source-arrow-shape"] = "triangle";
		edgeStyle["source-arrow-color"] = defaultColor;

		highlightedStyle["source-arrow-color"] = highlightedColor;
	}

	cy = cytoscape({
		container: document.getElementById("graphCanvas"),

		boxSelectionEnabled: false,
		autounselectify: true,

		style: cytoscape
			.stylesheet()
			.selector("node")
			.style({
				width: 10,
				height: 10,
			})
			.selector("edge")
			.style(edgeStyle)
			.selector(".highlighted")
			.style(highlightedStyle)
			.selector(".start")
			.style(startStyle)
			.selector(".target")
			.style(targetStyle)
			.selector(".visitedNode")
			.style(visitedStyleNode)
			.selector(".visitedEdge")
			.style(visitedStyleEdge)
			.selector(".finalPathNode")
			.style(finalPathStyleNode)
			.selector(".finalPathEdge")
			.style(finalPathStyleEdge),

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
				} else if (targetEvent.data().visited) {
					cy.$(`#${targetEvent.id()}`).removeClass("visitedNode");
				}

				data = `type: node; id: ${targetEvent.id()}`;
			} else {
				if (targetEvent.data().visited) {
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
				} else if (targetEvent.data().visited) {
					cy.$(`#${targetEvent.id()}`).addClass("visitedNode");
				}
			} else {
				if (targetEvent.data().visited) {
					cy.$(`#${targetEvent.id()}`).addClass("visitedEdge");
				}
			}

			// de-highlight element
			cy.$(`#${targetEvent.id()}`).removeClass("highlighted");
		}
	});
}

function runBfs(bfs) {
	cy.$(`#${bfs.startNode}`).addClass("start");
	cy.$(`#${bfs.targetNode}`).addClass("target");

	cy.$(`#${bfs.startNode}`).data().startNode = true;
	cy.$(`#${bfs.targetNode}`).data().targetNode = true;

	let iterateBfs = setInterval(() => {
		let bfsData = bfs.next();
		console.log(bfsData);
		if (bfsData.success) {
			bfsData = bfsData.value;
		} else {
			clearInterval(iterateBfs);
			loadFinalPath(bfs);
			return;
		}

		let edge = cy.$(`#${bfsData.edge}`);
		let node = cy.$(`#${bfsData.node}`);

		edge.addClass("visitedEdge");
		if (bfsData.node != bfs.targetNode) {
			node.addClass("visitedNode");
		}

		edge.data().visited = true;
		node.data().visited = true;

		// next iteration
		if (bfs.targetFound || bfsData == undefined) {
			clearInterval(iterateBfs);
			loadFinalPath(bfs);
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
		// let edge = cy.$(`#${path[counter]}`);

		let edge;
		if (!directed) {
			// issue
		} else {
			edge = cy.$(`#${path[counter]}-${path[counter + 1]}`);
		}

		edge.removeClass("visitedEdge");
		edge.addClass("finalPathEdge");

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
window.runBfs = runBfs;
