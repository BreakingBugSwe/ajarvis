// const hbs = require('hbs');
const ProcessState = require('../../lib/model/enum/ProcessStateSetting');
const ProjectStatus = require('../../lib/model/enum/ProjectStatusSetting');
const PhraseTypes = require('../../lib/tm/PhraseTypes');
const SortingSetting = require('../../lib/model/enum/SortingSetting');

const InfoStyle = {
	style: 'info',
	icon: 'fa-cog fa-spin',
};

const UnknownState = {
	text: 'Sconosciuto',
	style: 'warning',
	icon: 'fa-warning',
};

const ProcessStates = {
	[ProcessState.INITIAL]: {
		...InfoStyle,
		text: 'Caricamento',
	},
	[ProcessState.UPLOADED]: {
		...InfoStyle,
		text: 'Transcrizione',
	},
	[ProcessState.TRANSCRIPTED]: {
		...InfoStyle,
		text: 'Elaborazione',
	},
	[ProcessState.TEXTMINED]: {
		text: 'Elaborato',
		style: 'success',
		icon: 'fa-check',
	},
	[ProcessState.ERROR]: {
		text: 'Errore',
		style: 'error',
		icon: 'fa-exclamation',
	},
};

const ProjectStatuses = {
	[ProjectStatus.OPEN]: {
		text: 'Aperto',
		icon: 'fa-check',
		style: 'success',
	},
	[ProjectStatus.CLOSED]: {
		text: 'Chiuso',
		icon: 'fa-times',
		style: 'danger',
	},
};

const ProblemTypes = {
	[PhraseTypes.TASK]: 'Task',
	[PhraseTypes.PROBLEM]: 'Problema',
	[PhraseTypes.SOLUTION]: 'Soluzione',
	[PhraseTypes.CONTINUATION]: 'Continuazione',
	[PhraseTypes.IGNORE]: 'Ignorato',
};

const SortingSettings = {
	[SortingSetting.NAME]: 'Nome',
	[SortingSetting.LAST_EDIT]: 'Ultima modifica',
	[SortingSetting.CREATION_DATE]: 'Data di creazione',
	[SortingSetting.STATUS]: 'Stato del progetto',
};

function blockEnumFormatterFactory(enumMap, unknown = UnknownState) {
	return (context, options) => options.fn(enumMap[context] || unknown);
}

function inlineEnumFormatterFactory(enumMap, unknown = 'Sconosciuto') {
	return context => enumMap[context] || unknown;
}

exports.processState = blockEnumFormatterFactory(ProcessStates);
exports.projectStatus = blockEnumFormatterFactory(ProjectStatuses);
exports.problemType = inlineEnumFormatterFactory(ProblemTypes);
exports.sortingProject = inlineEnumFormatterFactory(SortingSettings);
