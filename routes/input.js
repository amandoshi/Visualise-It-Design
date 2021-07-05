// import dependencies
const { json } = require("express");
const express = require("express");
const router = express.Router();

// get request - input type
router.get("/", (req, res) => {
	res.render("inputGraph/inputType", {
		title: "Input Graph",
	});
});

// get request - file
router.get("/upload", (req, res) => {
	res.render("inputGraph/upload", {
		title: "Input Graph",
	});
});

// get request - select template
router.get("/template", (req, res) => {
	res.render("inputGraph/templates", {
		title: "Input Graph",
	});
});

// post request - select template
router.post("/template", (req, res) => {
	console.log(req.body);
});

// get request - custom graph
router.get("/custom", (req, res) => {
	res.render("inputGraph/custom", {
		title: "Input Graph",
	});
});

// post request - custom graph
router.post("/custom", (req, res) => {
	console.log(req.body);
	if (req.body.inputMethod == "edgeList") {
		res.render("inputGraph/customEdgeList", {
			title: "Input Graph",
			weighted: req.body.weighted,
			directed: req.body.directed,
		});
	} else if (req.body.inputMethod == "adjacencyList") {
		res.render("inputGraph/customNodes", {
			title: "Input Graph",
			weighted: req.body.weighted,
			directed: req.body.directed,
			inputMethod: req.body.inputMethod,
		});
	} else if (req.body.inputMethod == "adjacencyMatrix") {
		res.render("inputGraph/customNodes", {
			title: "Input Graph",
			weighted: req.body.weighted,
			directed: req.body.directed,
			inputMethod: req.body.inputMethod,
		});
	}
});

router.post("/custom/nodes", (req, res) => {
	let renderPage =
		req.body.inputMethod == "adjacencyList"
			? "customAdjacencyList"
			: "customAdjacencyMatrix";

	res.render(`inputGraph/${renderPage}`, {
		title: "Input Graph",
		weighted: req.body.weighted,
		directed: req.body.directed,
		nodes: req.body.nodes,
	});
});

// post request - store graph
router.post("/custom/uploadGraph", (req, res) => {
	// setup session
	req.session.weighted = req.body.weighted;
	req.session.directed = req.body.directed;
	req.session.matrix = req.body.matrix;
	req.session.nodes = req.body.nodes;
	req.session.negative = req.body.negative;

	// return redirect url
	let url = "/visualise";
	res.send({ url });
});

// TEST CODE -----------------------------------------------
router.get("/test", (req, res) => {
	res.render("test", {
		data: JSON.stringify([
			req.session.directed,
			req.session.weighted,
			req.session.matrix,
			req.session.nodes,
		]),
		matrix: JSON.stringify(req.session.matrix),
	});
});

router.post("/testReceiveData", (req, res) => {
	console.log(req.body);
});

module.exports = router;
