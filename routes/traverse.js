// import dependencies
const express = require("express");
const router = express.Router();

// get request - input type
router.get("/type", (req, res) => {
	let graphData = {
		weighted: req.session.weighted,
		negative: req.session.negative,
		nodes: req.session.nodes,
	};

	res.render("traverseGraph/traverseType", {
		title: "Traverse Type",
		graphData: JSON.stringify(graphData),
	});
});

router.post("/type", (req, res) => {
	req.session.traversalType = req.body.traversalType;
	req.session.startNodeIndex = req.body.startNodeIndex;
	req.session.targetNodeIndex = req.body.targetNodeIndex;

	let url = "/traverse/visualise";
	res.send({ url });
});

router.get("/visualise", (req, res) => {
	let graphData = {
		weighted: req.session.weighted,
		directed: req.session.directed,
		matrix: req.session.matrix,
		nodes: req.session.nodes,
		traversalType: req.session.traversalType,
		startNodeIndex: req.session.startNodeIndex,
		targetNodeIndex: req.session.targetNodeIndex,
	};

	res.render("traverseGraph/traverse", {
		title: "Graph Traversal",
		graphData: JSON.stringify(graphData),
	});
});

module.exports = router;
