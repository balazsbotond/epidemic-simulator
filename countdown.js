class Countdown {
	constructor(from, onFinish) {
		this.from = from;
		this.onFinish = onFinish;
		this.reset();
	}

	update() {
		if (this.finished) {
			return;
		}
		this.current--;
		if (this.current === 0) {
			this.finished = true;
			this.onFinish();
		}
	}

	reset() {
		this.current = this.from;
		this.finished = false;
	}
}
