/**
 * @file Script per l'aggiunta e rimozione di righe alla tabella dei collab
 * Data Creazione:  2018-05-04
 *
 * @version 0.0.3
 * @author	Giacomo Del Moro
 * @author  Alessandro Zangari
 * @author  Tommaso Sotte
 */
/* eslint-env browser, jquery */

window.CollaboratorsForm = (() => class CollaboratorsForm {
	/* eslint-disable-next-line object-curly-newline */
	constructor(opts = {}) {
		this.roles = opts.roles || [];
		this.$rowAdd = opts.$rowAdd;
		this.$rows = opts.$rows;
		this.collabs = opts.collabs || [];

		this.rowCounter = 0;

		this.$rowAdd.click(() => this.addRow());
	}

	build() {
		this.collabs.forEach(c => this.addRow(c.name, c.role));
	}

	addRow(name = '', role = '') {
		this.rowCounter += 1;
		const id = this.rowCounter;
		const row = `
			<div class="form-group form-collab form-row row" id="formCollab${id}">
				<div class="col-md">
					<input type="text" class="form-control name-collab" placeholder="Nome collaboratore" value="${name}" required>
				</div>
				<div class="col-md-3">
					<select class="form-control role-collab">
						${this.buildRolesOptions(role)}
					</select>
				</div>
				<div class="col-md-2 text-center">
					<button type="button" class="btn btn-outline-danger remove-collab" data-id="formCollab${id}" role="button" data-toggle="modal" data-target="#removeCollab">Rimuovi</button>
				</div>
			</div>`;

		$(row).prependTo(this.$rows);
	}

	buildRolesOptions(selected = '') {
		return this.roles
			.map(r => `<option ${selected === r && 'selected'}>${r}</option>`)
			.join('\n');
	}

	// => "nome1;ruolo1|...|nomeN;ruoloN"
	serializeCollaborators() {
		return $('.form-collab', this.$rows)
			.map((i, $row) => {
				const name = $('.name-collab', $row).val();
				const role = $('.role-collab', $row).val();

				return `${name};${role}`;
			})
			.get()
			.join('|');
	}
})();
