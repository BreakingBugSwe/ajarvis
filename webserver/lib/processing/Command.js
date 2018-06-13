class Command {
	constructor() {
		this.id = Command.nextCommandId();
	}

	async execute() {
		throw new Error(`${this.constructor.name}#execute not implemented yet`);
	}

	static nextCommandId() {
		Command.counter = Command.counter || 0;
		return Command.counter++;
	}
}

module.exports = Command;
