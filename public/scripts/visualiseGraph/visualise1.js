// load dependencies
let cytoscape = require("cytoscape");
let fcose = require("cytoscape-fcose");

// pass fcose middleware through cytoscape
cytoscape.use(fcose);

// global variables
let cy;

function visualiseGraph(graph) {
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
			.style({
				"curve-style": "bezier",
				"target-arrow-shape": "triangle",
				width: 1,
				"line-color": "#ddd",
				"target-arrow-color": "#ddd",
			})
			.selector(".highlighted")
			.style({
				"background-color": "#95eda4",
				"line-color": "#95eda4",
				"target-arrow-color": "#95eda4",
				"transition-property":
					"background-color, line-color, target-arrow-color",
			}),

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
