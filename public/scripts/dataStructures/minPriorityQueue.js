class MinPriorityQueue extends Queue {
	#elements;
	#compare;

	constructor(compare) {
		this.#elements = [undefined];
		this.#compare = compare;
	}

	addItem(item) {
		this.#elements.push(item);

		let itemIndex = this.#elements.length - 1;
		this.#siftup(itemIndex);
	}

	#siftup(index) {
		while (index > 1) {
			const parentIndex = Math.floor(index / 2);
			if (this.#compare(this.#elements[index], this.#elements[parentIndex])) {
				this.#swap(index, parentIndex);
				index = parentIndex;
			} else {
				break;
			}
		}
	}

	#swap(i, j) {
		const array = this.#elements;
		[array[i], array[j]] = [array[j], array[i]];
	}

	removeItem() {
		const root = this.#elements[1];
		const lastItem = this.#elements.pop(this.#elements.length - 1);

		if (!this.isEmpty()) {
			this.#elements[1] = lastItem;
			this.#siftdown(1);
		}

		return root;
	}

	#siftdown(index) {
		while (index * 2 < this.#elements.length) {
			const maxChildIndex =
				index * 2 + 1 < this.#elements.length &&
				this.#compare(this.#elements[index * 2 + 1], this.#elements[index * 2])
					? index * 2 + 1
					: index * 2;

			if (this.#compare(this.#elements[maxChildIndex], this.#elements[index])) {
				this.#swap(index, maxChildIndex);
				index = maxChildIndex;
			} else {
				break;
			}
		}
	}

	isEmpty() {
		return this.#elements.length - 1 == 0;
	}
}
