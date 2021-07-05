class Stack extends Queue {
	addItem(item) {
		this.#elements.unshift(item);
	}
}
