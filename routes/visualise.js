// import dependencies
const express = require("express");
const router = express.Router();

// get request - input type
router.get("/", (req, res) => {
	let graphData = {
		weighted: req.session.weighted,
		directed: req.session.directed,
		matrix: req.session.matrix,
		nodes: req.session.nodes,
	};

	res.render("visualiseGraph/visualise", {
		title: "Visualise Graph",
		graphData: JSON.stringify(graphData),
	});
});

module.exports = router;
