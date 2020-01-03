var greets = require('../server/protos/greet_pb');
var service = require('../server/protos/greet_grpc_pb');

var blogs = require('../server/protos/blog_pb');
var blogService = require('../server/protos/blog_grpc_pb');

var calc = require('../server/protos/calculator_pb');
var calcService = require('../server/protos/calculator_grpc_pb');

var fs = require('fs');

var grpc = require('grpc');

const environment = process.env.ENVIRONMENT || 'development';
const config = require('./knexfile')[environment];
const knex = require('knex')(config);

/* credential variable not working with nodemon, cannot open directory error */
let credentials = grpc.ServerCredentials.createSsl(
  fs.readFileSync('../certs/ca.crt'),
  [
    {
      cert_chain: fs.readFileSync('../certs/server.crt'),
      private_key: fs.readFileSync('../certs/server.key')
    }
  ],
  true
);

let unsafeCreds = grpc.ServerCredentials.createInsecure();

function deleteBlog(call, callback) {
  var blogId = call.request.getBlogId();

  console.log('getting blog...');

  knex('blogs')
    .where({ id: parseInt(blogId) })
    .delete()
    .returning()
    .then(data => {
      console.log('deleting blog...');
      if (data) {
        var deleteResponse = new blogs.DeleteBlogResponse();
        deleteResponse.setBlogId(blogId);

        console.log(
          'Blog is now deleted with id: ',
          deleteResponse.toString()
        );

        callback(null, deleteResponse);
      } else {
        return callback({
          code: grpc.status.NOT_FOUND,
          message: 'blog with that id not found'
        });
      }
    });
}

function updateBlog(call, callback) {
  var blogId = call.request.getBlog().getId();

  console.log('searching for blog to update...');

  knex('blogs')
    .where({ id: parseInt(blogId) })
    .update({
      author: call.request.getBlog().getAuthor(),
      title: call.request.getBlog().getTitle(),
      content: call.request.getBlog().getContent()
    })
    .returning()
    .then(data => {
      if (data) {
        var blog = new blogs.Blog();
        console.log('blog found...');

        blog.setId(blogId);
        blog.setAuthor(data.author);
        blog.setTitle(data.title);
        blog.setContent(data.content);

        var updateBlogResponse = new blogs.UpdateBlogResponse();
        updateBlogResponse.setBlog(blog);

        console.log('Updated ====', updateBlogResponse.getBlog().getId());

        callback(null, updateBlogResponse);
      }
    });
}

function readBlog(call, callback) {
  var blogId = call.request.getBlogId();

  knex('blogs')
    .where({
      id: parseInt(blogId)
    })
    .then(data => {
      console.log('searching for blog....');

      if (data.length) {
        var blog = new blogs.Blog();
        console.log('blog found and sending message');

        blog.setId(blogId);
        blog.setAuthor(data[0].author);
        blog.setTitle(data[0].title);
        blog.setContent(data[0].content);

        var blogResponse = new blogs.ReadBlogResponse();
        blogResponse.setBlog(blog);

        callback(null, blogResponse);
      } else {
        console.log('blog not found');
        return callback({
          code: grpc.status.NOT_FOUND,
          message: 'blog not found...'
        });
      }
    });
}

function createBlog(call, callback) {
  var blog = call.request.getBlog();
  knex('blogs')
    .insert({
      author: blog.getAuthor(),
      title: blog.getTitle(),
      content: blog.getContent()
    })
    .then(() => {
      var id = blog.getId();

      var addedBlog = new blogs.Blog();

      addedBlog.setId(id);
      addedBlog.setAuthor(blog.getAuthor());
      addedBlog.setTitle(blog.getTitle());
      addedBlog.setContent(blog.getContent());

      var blogResponse = new blogs.CreateBlogResponse();

      blogResponse.setBlog(addedBlog);

      console.log('inserted blog with id: ', blogResponse);

      callback(null, blogResponse);
    });
}

function listBlog(call, callback) {
  knex('blogs').then(data => {
    data.forEach(el => {
      var blog = new blogs.Blog();
      blog.setId(el.id);
      blog.setAuthor(el.author);
      blog.setTitle(el.title);
      blog.setContent(el.content);

      var blogResponse = new blogs.ListBlogResponse();
      blogResponse.setBlog(blog);

      call.write(blogResponse);
    });
    call.end();
  });
}

async function sleep(interval) {
  return new Promise(resolve => {
    setTimeout(() => resolve(), interval);
  });
}

function squareRoot(call, callback) {
  var number = call.request.getNumber();

  if (number >= 0) {
    var numberRoot = Math.sqrt(number);
    var response = new calc.SquareRootResponse();
    response.setNumberRoot(numberRoot);

    callback(null, response);
  } else {
    // error handling
    return callback({
      code: grpc.status.INVALID_ARGUMENT,
      message: 'the number sent is not positive ' + ' number sent: ' + number
    });
  }
}

function findMaximum(call, callback) {
  var currentNumber = 0;
  var currentMaximum = 0;

  call.on('data', request => {
    currentNumber = request.getNumber();

    if (currentNumber > currentMaximum) {
      currentMaximum = currentNumber;

      var response = new calc.FindMaximumResponse();
      response.setMaximum(currentMaximum);

      call.write(response);
    } else {
      // do nothing
    }
    console.log('Streamed number: ', request.getNumber());
  });
  call.on('error', error => {
    console.error(error);
  });

  call.on('end', () => {
    var response = new calc.FindMaximumResponse();
    response.setMaximum(currentMaximum);

    call.write(response);

    call.end();
    console.log('The end!');
  });
}

async function greetEveryone(call, callback) {
  call.on('data', response => {
    var fullName =
      response.getGreet().getFirstName() +
      ' ' +
      response.getGreet().getLastName();

    console.log('Hello ' + fullName);
  });

  call.on('error', error => {
    console.error(error);
  });

  call.on('end', () => {
    console.log('Server The End...');
  });

  for (var i = 0; i < 10; i++) {
    // var greeting = new greets.Greeting()
    // greeting.setFirstName('Paulo')
    // greeting.setLastName('Dichone')

    var request = new greets.GreetEveryoneResponse();
    request.setResult('Paulo Dichone');

    call.write(request);
    await sleep(1000);
  }

  call.end();
}

function computeAverage(call, callback) {
  var sum = 0;
  var count = 0;

  call.on('data', request => {
    sum += request.getNumber();

    console.log('got number: ' + request.getNumber());

    count += 1;
  });
  call.on('error', error => {
    console.error(error);
  });
  call.on('end', () => {
    let average = sum / count;

    let response = new calc.ComputeAverageResponse();
    response.setAverage(average);

    callback(null, response);
  });
}

function greetManyTimes(call, callback) {
  var firstName = call.request.getGreeting().getFirstName();

  let count = 0,
    intervalID = setInterval(function() {
      var greetManyTimesResponse = new greets.GreetManyTimesResponse();
      greetManyTimesResponse.setResult(firstName);

      // setup streaming
      call.write(greetManyTimesResponse);
      if (++count > 9) {
        clearInterval(intervalID);
        call.end(); // we have sent all messages!
      }
    }, 1000);
}

function primeNumberDecomposition(call, callback) {
  var number = call.request.getNumber();
  var divisor = 2;

  console.log('Received number: ', number);

  while (number > 1) {
    if (number % divisor === 0) {
      var primeNumberDecompositionResponse = new calc.PrimeNumberDecompositionResponse();

      primeNumberDecompositionResponse.setPrimeFactor(divisor);

      number = number / divisor;

      //write the message using call.write()
      call.write(primeNumberDecompositionResponse);
    } else {
      divisor++;
      console.log('Divisor has increased to ', divisor);
    }
  }

  call.end(); // all messages sent! we are done
}

function sum(call, callback) {
  var sumResponse = new calc.SumResponse();

  sumResponse.setSumResult(
    call.request.getFirstNumber() + call.request.getSecondNumber()
  );

  callback(null, sumResponse);
}

function greet(call, callback) {
  var greeting = new greets.GreetResponse();

  greeting.setResult(
    'Hello ' +
      call.request.getGreeting().getFirstName() +
      ' ' +
      call.request.getGreeting().getLastName()
  );

  callback(null, greeting);
}

function longGreet(call, callback) {
  call.on('data', request => {
    var fullName =
      request.getGreet().getFirstName() +
      ' ' +
      request.getGreet().getLastName();

    console.log('hello ' + fullName);
  });

  call.on('error', error => {
    console.error(error);
  });
  call.on('end', () => {
    var response = new greets.LongGreetResponse();
    response.setResult('long greet client streaming....');

    callback(null, response);
  });
}

function main() {
  const server = new grpc.Server();

  server.addService(blogService.BlogServiceService, {
    listBlog: listBlog,
    createBlog: createBlog,
    readBlog: readBlog,
    updateBlog: updateBlog,
    deleteBlog: deleteBlog
  });
  server.addService(calcService.CalculatorServiceService, {
    sum: sum,
    primeNumberDecomposition: primeNumberDecomposition,
    computeAverage: computeAverage,
    findMaximum: findMaximum,
    squareRoot: squareRoot
  });
  server.addService(service.GreetServiceService, {
    greet: greet,
    greetManyTimes: greetManyTimes,
    longGreet: longGreet,
    greetEveryone: greetEveryone
  });
  server.bind('127.0.0.1:50051', unsafeCreds);
  server.start();

  console.log('server running on port 127.0.0.1:50051', unsafeCreds);
}

main();
