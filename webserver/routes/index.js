/**
 * Nome File:       index.js
 * Data Creazione:  2018-02-22
 *
 * Raccoglie tutte le routes dell'app in un unico router.
 *
 * @file    Routes dell'app
 * @version 0.0.5
 * @author  Tommaso Sotte
 * @author	Alessandro Zangari
 */

const express = require('express');
const home = require('./controllers/home');
const standups = require('./controllers/standups');
const project = require('./controllers/project');
const projectSettings = require('./controllers/projectSettings');
const projectTrash = require('./controllers/projectTrash');
const recording = require('./controllers/recording');
const record = require('./controllers/record');
const settings = require('./controllers/settings');
const trash = require('./controllers/trash');
const notFound = require('./controllers/notFound');
const error500 = require('./controllers/error500');


const router = express.Router();

router.get('/', home.index);

router.get('/settings', settings.get);
router.post('/settings', settings.save);

router.get('/projects', home.getProjects);
router.get('/standups', standups.view);

router.all('/projects/trash*', trash.load);
router.get('/projects/trash', trash.get);
router.all(/^\/projects\/trash\/(delete|untrash)$/, trash.loadId);
router.post('/projects/trash/delete', trash.delete);
router.post('/projects/trash/untrash', trash.untrash);

router.get('/projects/new', project.new);
router.post('/projects/new', project.saveNew);

router.all('/project/:projectId*', project.load);
router.get('/project/:projectId', project.get);

router.get('/project/:projectId/recordings', standups.view);

router.get('/project/:projectId/delete', project.delete);

router.get('/project/:projectId/settings', projectSettings.get);
router.post('/project/:projectId/settings', projectSettings.save);

router.all('/project/:projectId/trash*', projectTrash.load);
router.get('/project/:projectId/trash', projectTrash.get);
// NOTE: loadId rende disponibile la lista dei selezionati a delete
router.all('/project/:projectId/trash/:pag(delete|untrash)', projectTrash.loadId);
router.post('/project/:projectId/trash/delete', projectTrash.delete);
router.post('/project/:projectId/trash/untrash', projectTrash.untrash);

router.get('/project/:projectId/recording/new', record.new);
router.post('/project/:projectId/recording/new', record.saveNew);

router.all('/project/:projectId/recording/:recordingId*', recording.load);
router.get('/project/:projectId/recording/:recordingId', recording.get);
router.get('/project/:projectId/recording/:recordingId/redoUpload', recording.redoUpload);
router.get('/project/:projectId/recording/:recordingId/redoTranscription', recording.redoTranscription);
router.get('/project/:projectId/recording/:recordingId/redoTextMining', recording.redoTextMining);
router.get('/project/:projectId/recording/:recordingId/delete', recording.delete);
router.post('/project/:projectId/recording/:recordingId/editTranscription', recording.editTranscription);

// 404: Not Found
router.use(notFound.view);

// 500: Every other error
router.use(error500.view);

module.exports = router;
