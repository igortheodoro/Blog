var express = require('express');
var app = express();

var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var mongoose = require('mongoose');
var expressSanitizer = require('express-sanitizer');

// Configuração do banco de dados
mongoose.set('useNewUrlParser', true);
mongoose.set('useUnifiedTopology', true);
mongoose.set('useFindAndModify', false);
mongoose.connect('mongodb://localhost/blog_app');

// Configurações do app
app.use(
	bodyParser.urlencoded({
		extended: true
	})
);
app.use(expressSanitizer()); // Tem que ser após o BODY-PARSER
app.set('view engine', 'ejs');
app.use(express.static('public'));

app.use(methodOverride('_method'));

// Configuração esquema mongoose

var postSchema = new mongoose.Schema({
	title: String,
	img: String,
	text: String,
	created: { type: Date, default: Date.now }
});

var post = mongoose.model('post', postSchema);

// Rotas

app.get('/', function(req, res) {
	res.redirect('/posts');
});

app.get('/posts', function(req, res) {
	post.find({}, function(err, posts) {
		// Encontra todas postagens no banco
		if (err) {
			console.log('Ocorreu um erro: ' + err);
		} else {
			res.render('index', {
				posts: posts
			});
		}
	});
});

app.get('/posts/new', function(req, res) {
	res.render('new');
});

//Create
app.post('/posts/new', function(req, res) {
	var title = req.sanitize(req.body.title);
	var img = req.sanitize(req.body.img);
	var text = req.sanitize(req.body.text);

	post.create(
		{
			title: title,
			img: img,
			text: text
		},
		function(err, post) {
			if (err) {
				console.log('Erro na criação: ' + err);
			} else {
				res.redirect('/posts');
			}
		}
	);
});

app.get('/posts/:id', function(req, res) {
	var id = req.params.id;

	post.findById(id, function(err, found) {
		if (err) {
			console.log('Erro ao encontrar o id: ' + err);
		} else {
			res.render('show', {
				found: found
			});
		}
	});
});

app.get('/posts/:id/edit', function(req, res) {
	var id = req.params.id;

	post.findById(id, function(err, found) {
		if (err) {
			console.log('Erro ao encontrar o edit: ' + err);
		} else {
			res.render('edit', {
				post: found
			});
		}
	});
});

app.put('/posts/:id', function(req, res) {
	var title = req.sanitize(req.body.title);
	var img = req.sanitize(req.body.img);
	var text = req.sanitize(req.body.text);

	var body = {
		title: title,
		img: img,
		text: text
	};

	post.findByIdAndUpdate(req.params.id, body, function(err, updated) {
		if (err) {
			res.redirect('/posts');
		} else {
			res.redirect('/posts/' + req.params.id);
		}
	});
});

app.delete('/posts/:id', function(req, res) {
	post.findByIdAndDelete(req.params.id, function(err, deleted) {
		if (err) {
			res.redirect('/posts/' + req.params.id);
		} else {
			res.redirect('/posts');
		}
	});
});

app.listen(3000, function() {
	console.log('Servidor iniciado!');
});
