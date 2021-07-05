class Bfs {
	#graph;
	#startNode;
	#targetNode;
	#unvisitedNodes;
	#visitedNodes;
	#previousNodes;
	#targetFound;
	#traversal;

	constructor(graph, startNode, targetNode) {
		this.#graph = graph;
		this.#startNode = startNode;
		this.#targetNode = targetNode;

		this.#targetFound = false;
		this.#unvisitedNodes = new Queue();
		this.#visitedNodes = new Set();
		this.#previousNodes = new Object();

		this.#unvisitedNodes.addItem(startNode);
		this.#visitedNodes.add(startNode);
		this.#previousNodes[startNode] = startNode;

		this.#traversal = this.#run();
	}

	*#run() {
		while (!this.#unvisitedNodes.isEmpty() && !this.#targetFound) {
			let currentNode = this.#unvisitedNodes.removeItem();

			let neighbourNodes = this.#graph.getNeighbourNodes(currentNode);

			for (let i = 0; i < neighbourNodes.length; i++) {
				let neighbourNode = neighbourNodes[i].value;

				// visit node, add unvisited neighbours
				if (!this.#visitedNodes.has(neighbourNode)) {
					this.#unvisitedNodes.addItem(neighbourNode);
					this.#visitedNodes.add(neighbourNode);
					this.#previousNodes[neighbourNode] = currentNode;

					if (neighbourNode == this.#targetNode) {
						this.#targetFound = true;
					}

					// yield edge id, node id
					let yieldData = {
						node: this.#graph.nodes[neighbourNode],
						edge: this.connection(
							this.#graph.nodes[currentNode],
							this.#graph.nodes[neighbourNode]
						),
					};

					yield yieldData;
				}
			}
		}
	}

	next() {
		if (!this.#targetFound) {
			let returnValue = this.#traversal.next();
			if (returnValue.done) {
				return { success: false };
			} else {
				return { success: true, value: returnValue.value };
			}
		} else {
			return { success: false };
		}
	}

	finalPath() {
		if (!this.#targetFound) {
			return [];
		}

		let path = new Array();
		path.push(this.#graph.nodes[this.#targetNode]);

		let nextNode = this.#previousNodes[this.#targetNode];
		path.unshift(this.#graph.nodes[nextNode]);

		while (nextNode != this.#startNode) {
			nextNode = this.#previousNodes[nextNode];
			path.unshift(this.#graph.nodes[nextNode]);
		}

		return path;
	}

	connection(node1, node2) {
		let edge = [
			this.#graph.nodes.indexOf(node1),
			this.#graph.nodes.indexOf(node2),
		];
		if (!this.#graph.directed) {
			edge = edge.sort();
		}
		return `${this.#graph.nodes[edge[0]]}-${this.#graph.nodes[edge[1]]}`;
	}

	get targetFound() {
		return this.#targetFound;
	}

	get startNode() {
		return this.#graph.nodes[this.#startNode];
	}

	get targetNode() {
		return this.#graph.nodes[this.#targetNode];
	}

	get graph() {
		return this.#graph;
	}
}
