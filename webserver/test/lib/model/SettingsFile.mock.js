const SettingsFile = require('../../../lib/model/SettingsFile');

jest.mock('../../../lib/model/SettingsFile');

SettingsFile.getRoles = jest.fn().mockReturnValue(['Amministratore', 'Membro']);

module.exports = SettingsFile;
