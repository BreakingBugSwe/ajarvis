#!/usr/bin/env node

/**
 * @file Express app server
 * Data Creazione:  2018-02-22
 * @version 0.0.1
 * @author  Tommaso Sotte
 */

const path = require('path');

const express = require('express');
require('express-async-errors');
const favicon = require('serve-favicon');
// const cookieParser = require('cookie-parser');
// const bodyParser = require('body-parser');
const morgan = require('morgan');
/**
 * Istanza di hbs (handlebars per express) associata all'istanza di express.
 * @type {[type]}
 */
const hbs = require('hbs');
// Helpers creati da noi per comodità
const helpers = require('./views/helpers');
// Collezione di helpers generici
const handlebarsHelpers = require('handlebars-helpers');
// const handlebarsLayouts = require('handlebars-layouts');

const EmptyTrashOlderCron = require('./lib/cron/EmptyTrashOlderCron');
const recordingTrash = require('./lib/model/RecordingTrash');
const projectTrash = require('./lib/model/ProjectTrash');

const routes = require('./routes');

const app = express();

// Database e ORM
const gstore = require('gstore-node')();
const datastore = require('./lib/gcp/Datastore');

// Collega il Datastore a gstore (ORM)
gstore.connect(datastore);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
// Partials/Layouts
// const partialsPath = path.join(__dirname, 'views', 'partials');
hbs.registerPartials(path.join(__dirname, 'views', 'partials'));
// hbs.registerHelper(handlebarsLayouts(hbs));
// Helpers
handlebarsHelpers({ handlebars: hbs });
helpers({ hbs });

app.use(express.urlencoded({ extended: false }));
// app.use(bodyParser.json());
// app.use(cookieParser());

// Requests logger
app.use(morgan('dev'));

// file statici: immagini, css, js, favicon
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(express.static(path.join(__dirname, 'public')));

// load all routes
app.use(routes);

// error handler
app.use((err, req, res) => {
	// set locals, only providing error in development
	res.locals.message = err.message;
	res.locals.error = req.app.get('env') === 'development' ? err : {};

	// render the error page
	res.status(err.status || 500);
	res.render('error');
});

// Setup trash older cron
const recordingTrashCron = new EmptyTrashOlderCron(recordingTrash);
const projectTrashCron = new EmptyTrashOlderCron(projectTrash);
recordingTrashCron.start();
projectTrashCron.start();

module.exports = app;
