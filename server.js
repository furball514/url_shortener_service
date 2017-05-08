const koa  = require('koa'); //core module
const router = require('koa-router'); //router
const pug = require('koa-pug'); //template
const parse = require('co-body'); //bodyParser
const shortid = require('shortid'); //id generator
const mongoose = require('mongoose'); //mongodb driver optionally use mongodb/koa-mongoose
const url = require('./models/url'); //mongodb model
//const http = require('http'); to check if entered url exists 

//connect to mLab db
mongoose.connect(`mongodb://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`);
//error handling
  mongoose.connection.on('connected', () => {
		console.log('Database connected');
    app.listen(process.env.PORT,() => { //listen to port
	console.log(`listening ${process.env.PORT}`);
});
	});
	mongoose.connection.on('disconnected', () => {
		console.log('Database disconnected');
	});
	mongoose.connection.on('error', err => {
		console.log(`Database error on connection: ${err}`);
	});
	process.on('SIGINT', () => {
   mongoose.connection.close(() => {
			console.log('Database disconnected due the end of application');
			process.exit(0);
		});
	});

const app = new koa(); //instantiate core module
const Router = new router(); //instantiate router
const Pug = new pug({
	viewPath: './views',
    basedir: './views',   //instantiate template, directory of pug files
    app: app // same as app.use(pug);
});

//define routes
Router.get('/',renderForm); //render form.pug
Router.post('/',handleForm); //takes input from form.pug and passes as param to shortened
Router.get('/shortened/:link',shortened); //input url is checked against db then shortened and rendered
Router.get('/:red',red); //redirect to long url from shortend url
Router.get('/url_does_not_exist',(ctx) => {ctx.body = '<h1>The URL you entered does not exist</h1><br><a href="https://ee.glitch.me">Click here to return to homepage</a>';}) //page to show if input url doesn't exist

//---------------------------------------------------------------------------------------------
//check to see if url exists function (not enabled)
const exist = (url) => {
 let result = true;/*
  const options = {method: 'HEAD', host: url, port: 80, path: '/'}
  const req = http.request(options, function(r) {
        console.log(JSON.stringify(r.headers));
    });
req.end();*/
  return result; //return true
  console.log('exist');
}
//shorten link
const shortener = (link) => { //get longlink
  console.log(link);
  let newid = shortid.generate(); //generate id
  return `https://ee.glitch.me/${newid}`; //return short url
  console.log('shortened');
}
//---------------------------------------------------------------------------------------------

async function renderForm (ctx) {
     ctx.render('form');  //render form.pug
  console.log('render form');
}

async function handleForm (ctx) {
  let pass = await parse(ctx); //parse input from body
  if (exist(pass.body.replace(/"/g,''))) { //if input url(without quotes) exists then pass to shortened as param
	ctx.redirect(`/shortened/${encodeURIComponent(JSON.stringify(pass.body))}`); //encode url and convert to string
  }/*
  else {
    ctx.redirect('/url_does_not_exist'); //if url doesn't exist then redirect to error page
    console.log(exist(pass.body));
  }*/
  console.log('passing to shortened');
}

async function shortened (ctx) { //search db if url already entered
//check if already exists before making new entry
  try {
    const match = await url.findOne({url: ctx.params.link.replace(/"/g,'')}); 
    if (match){
      ctx.render('shortened',{
        url: match.url,
        shortenedLink: match.shortenedLink
      });
    }
    else {
      let obj = {
        url: ctx.params.link.replace(/"/g,''),
        shortenedLink: shortener(ctx.params.link)
      }
      let data = new url(obj);
      data.save();
      ctx.render('shortened',obj);
    }
  }
  catch (err) {
    throw err;
  }
}

async function red (ctx) { //redirect to long link from short link
  let redurl = `https://ee.glitch.me/${ctx.params.red}`;
  console.log(redurl);
  try {
      const data = await url.findOne({ shortenedLink: redurl });
      if (data) {
        ctx.redirect(data.url); 
        console.log("matched");
      } else {
        //console.error("--");
        ctx.redirect('/url_does_not_exist');
      }
  } catch (err) {
      throw err;
  }
}

//optional redirect
/*async function redirect (ctx) {
   if (404 != ctx.status) return;
   ctx.redirect('/');
  console.log('to homepage');
}*/

app.use(Router.routes()); //use routes
//app.use(redirect);


