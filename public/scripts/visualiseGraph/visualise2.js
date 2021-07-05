// load dependencies
let cytoscape = require("cytoscape");
let fcose = require("cytoscape-fcose");

// pass fcose middleware through cytoscape
cytoscape.use(fcose);

// global variables
let cy;

function visualiseGraph(graph) {
	let defaultColor = "#ddd";
	let highlightedColor = "#95eda4";

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
			.style(highlightedStyle),

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
				data = `type: node; id: ${targetEvent.id()}`;
			} else {
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

			// de-highlight element
			cy.$(`#${targetEvent.id()}`).removeClass("highlighted");
		}
	});
}

// export visualise graph function
window.visualiseGraph = visualiseGraph;
window.setupHighlightedElements = setupHighlightedElements;
