class Queue {
	#elements;

	constructor() {
		this.#elements = new Array();
	}

	addItem(item) {
		this.#elements.push(item);
	}

	removeItem() {
		return !this.isEmpty() ? this.#elements.shift() : undefined;
	}

	isEmpty() {
		return this.#elements.length == 0;
	}

	get elements() {
		return this.#elements;
	}
}
