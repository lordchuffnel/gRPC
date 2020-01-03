var greets = require('../server/protos/greet_pb');
var service = require('../server/protos/greet_grpc_pb');

var calc = require('../server/protos/calculator_pb');
var calcService = require('../server/protos/calculator_grpc_pb');

const fs = require('fs');


var grpc = require('grpc');

let credentials = grpc.ServerCredentials.createSsl(
  fs.readFileSync('../certs/ca.crt'),
  [{
    cert_chain: fs.readFileSync('../certs/server.crt'),
    private_key: fs.readFileSync('../certs/server.key')
  }]
)

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
  server.addService(calcService.CalculatorServiceService, {
    sum: sum,
    primeNumberDecomposition: primeNumberDecomposition,
    computeAverage: computeAverage,
    findMaximum: findMaximum,
    squareRoot: squareRoot
  });

  // server.addService(service.GreetServiceService, {
  //   greet: greet,
  //   greetManyTimes: greetManyTimes,
  //   longGreet: longGreet,
  //   greetEveryone: greetEveryone
  // });
  server.bind('127.0.0.1:50051', grpc.ServerCredentials.createInsecure());
  server.start();

  console.log('server running on port 127.0.0.1:50051');
}

main();
