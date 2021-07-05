class Graph {
	#directed;
	#graph;
	#nodes;
	#size;
	#weighted;
	#negative;

	constructor(directed, weighted) {
		this.#directed = directed;
		this.#weighted = weighted;
		this.#negative = false;
	}

	#convertEdgeList(edgeList) {
		let nodes = new Set();

		// get unique nodes
		for (let i = 0; i < edgeList.length; i++) {
			nodes.add(edgeList[i][0]);
			nodes.add(edgeList[i][1]);
		}

		// set up array of unique nodes
		this.#nodes = Array.from(nodes);

		// set graph size
		this.#size = this.#nodes.length;

		// setup graph matrix
		this.#setupGraphMatrix();
		for (let i = 0, edgeWeight, edgeFrom, edgeTo; i < edgeList.length; i++) {
			edgeWeight = this.#weighted ? edgeList[i][2] : 1;
			edgeFrom = this.#nodes.indexOf(edgeList[i][0]);
			edgeTo = this.#nodes.indexOf(edgeList[i][1]);
			this.#graph[edgeFrom][edgeTo] = parseInt(edgeWeight);

			if (!this.#directed) {
				this.#graph[edgeTo][edgeFrom] = parseInt(edgeWeight);
			}

			// check negative edges
			if (edgeWeight < 0) {
				this.#negative = true;
			}
		}
	}

	#convertAdjacencyList(adjacencyList) {
		this.#nodes = Object.keys(adjacencyList);
		this.#size = this.#nodes.length;

		// setup graph matrix
		this.#setupGraphMatrix();
		for (const node of this.#nodes) {
			for (const connection of adjacencyList[node]) {
				let nodeFrom = this.#nodes.indexOf(node);
				let nodeTo;

				// default weight of undirected graph
				let edgeWeight = 1;

				// set paramters of connection
				if (this.#weighted) {
					nodeTo = this.#nodes.indexOf(connection.node);
					edgeWeight = parseInt(connection.weight);

					// negative weights
					if (edgeWeight < 0 && !this.#negative) {
						this.#negative = true;
					}
				} else {
					nodeTo = this.#nodes.indexOf(connection);
				}

				// set graph connections
				this.#graph[nodeFrom][nodeTo] = edgeWeight;
				if (!this.#directed) {
					this.#graph[nodeTo][nodeFrom] = edgeWeight;
				}
			}
		}
	}

	#convertAdjacencyMatrix(matrix) {
		this.#graph = matrix;
		this.#size = this.#graph.length;

		// check negative edges
		for (const connection of matrix) {
			if (this.#negative) {
				break;
			}

			for (const weight of connection) {
				if (weight < 0) {
					this.#negative = true;
					break;
				}
			}
		}
	}

	#setupGraphMatrix() {
		this.#graph = new Array(this.#size);
		for (let i = 0, subArr; i < this.#size; i++) {
			subArr = new Array(this.#size);
			subArr.fill(0);
			this.#graph[i] = subArr;
		}
	}

	setGraph(graph, graphType) {
		switch (graphType) {
			case "edgeList":
				this.#convertEdgeList(graph);
				break;
			case "adjacencyList":
				this.#convertAdjacencyList(graph);
				break;
			case "adjacencyMatrix":
				this.#convertAdjacencyMatrix(graph);
				break;
			default:
				throw Error("Invalid graphType");
		}
	}

	getNeighbourNodes(nodeIndex) {
		let neighbourNodes = new Array();
		for (let i = 0, nodeData; i < this.#size; i++) {
			if (this.#graph[nodeIndex][i]) {
				nodeData = { value: i };
				if (this.#weighted) {
					nodeData.weighted = this.#graph[node][i];
				}
				neighbourNodes.push(nodeData);
			}
		}

		return neighbourNodes;
	}

	getCyNodes() {
		let nodesArr = new Array();

		for (let i = 0; i < this.#size; i++) {
			nodesArr.push({ data: { id: `${this.#nodes[i]}` } });
		}

		return nodesArr;
	}

	getCyEdges() {
		let edgesArr = new Array();
		for (
			let i = 0, shift = 0;
			i < this.#size;
			i++, shift += !this.#directed ? 1 : 0
		) {
			for (let j = !this.#directed ? shift : 0, data; j < this.#size; j++) {
				if (this.#graph[i][j] != 0) {
					data = {
						data: {
							id: `${this.#nodes[i]}-${this.#nodes[j]}`,
							weight: this.#graph[i][j],
							source: `${this.#nodes[i]}`,
							target: `${this.#nodes[j]}`,
						},
					};
					edgesArr.push(data);
				}
			}
		}
		return edgesArr;
	}

	get directed() {
		return this.#directed;
	}

	get graph() {
		return this.#graph;
	}

	get size() {
		return this.#size;
	}

	get weighted() {
		return this.#weighted;
	}

	get nodes() {
		return this.#nodes;
	}

	get negative() {
		return this.#negative;
	}

	set directed(isDirected) {
		this.#directed = isDirected;
	}

	set graph(matrix) {
		this.#graph = matrix;
		this.#size = matrix.length;
	}

	set nodes(nodesArr) {
		this.#nodes = nodesArr;
	}

	set weighted(isWeighted) {
		this.#weighted = isWeighted;
	}
}
