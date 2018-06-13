const Command = require('./Command');

class ResetOpenProblemsCommand extends Command {
	constructor(project) {
		super();
		this.project = project;
	}

	async execute() {
		this.project.openProblems = [];
		await this.project.save();
	}
}

module.exports = ResetOpenProblemsCommand;
