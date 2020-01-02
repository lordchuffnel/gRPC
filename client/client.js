var greets = require('../server/protos/greet_pb');
var service = require('../server/protos/greet_grpc_pb');
var calc = require('../server/protos/calculator_pb');
var calcService = require('../server/protos/calculator_grpc_pb');

var grpc = require('grpc');

async function sleep(interval) {
  return new Promise(resolve => {
    setTimeout(() => resolve(), interval);
  });
}

async function callFindMaximum() {
  console.log("hello I'm a gRPC Client");

  var client = new calcService.CalculatorServiceClient(
    'localhost:50051',
    grpc.credentials.createInsecure()
  );

  var call = client.findMaximum(request, (error, response) => {});

  call.on('data', response => {
    console.log('New max from server > ' + response.getMaximum());
  });
  call.on('error', error => {
    console.error(error);
  });
  call.on('end', () => {
    console.log('server has completed');
  });
  let data = [3, 4, 6, 7, 34, 684, 23, 0];
  for (var i = 0; i < data.length; i++) {
    var request = new calc.FindMaximumRequest();
    console.log('sending number: ' + data[i]);

    request.setNumber(data[i]);
    call.write(request);
    await sleep(1000);
  }
  call.end();
}

async function callBiDirect() {
  // Created our server client
  console.log("hello I'm a gRPC Client");

  var client = new service.GreetServiceClient(
    'localhost:50051',
    grpc.credentials.createInsecure()
  );

  var call = client.greetEveryone(request, (error, response) => {
    console.log('Server Response: ' + response);
  });

  call.on('data', response => {
    console.log('Hello Client!' + response.getResult());
  });

  call.on('error', error => {
    console.error(error);
  });

  call.on('end', () => {
    console.log('Client The End');
  });

  for (var i = 0; i < 10; i++) {
    var greeting = new greets.Greeting();
    greeting.setFirstName('Stephane');
    greeting.setLastName('Maarek');

    var request = new greets.GreetEveryoneRequest();
    request.setGreet(greeting);

    call.write(request);

    await sleep(1500);
  }

  call.end();
}

function callSum() {
  var client = new calcService.CalculatorServiceClient(
    'localhost:50051',
    grpc.credentials.createInsecure()
  );

  var sumRequest = new calc.SumRequest();

  sumRequest.setFirstNumber(10);
  sumRequest.setSecondNumber(15);

  client.sum(sumRequest, (error, response) => {
    if (!error) {
      console.log(
        sumRequest.getFirstNumber() +
          ' + ' +
          sumRequest.getSecondNumber() +
          ' = ' +
          response.getSumResult()
      );
    } else {
      console.error(error);
    }
  });
}

function callPrimeNumberDecomposition() {
  var client = new calcService.CalculatorServiceClient(
    'localhost:50051',
    grpc.credentials.createInsecure()
  );

  var request = new calc.PrimeNumberDecompositionRequest();

  var number = 750; //567890

  request.setNumber(number);

  var call = client.primeNumberDecomposition(request, () => {});

  call.on('data', response => {
    console.log('Prime Factors Found: ', response.getPrimeFactor());
  });

  call.on('error', error => {
    console.error(error);
  });

  call.on('status', status => {
    console.log(status);
  });

  call.on('end', () => {
    console.log('Streaming Ended!');
  });
}

function greet() {
  const client = new service.GreetServiceClient(
    'localhost:50051',
    grpc.credentials.createInsecure()
  );
  // we do stuff here
  const request = new greets.GreetRequest();
  const greeting = new greets.Greeting();
  greeting.setFirstName('peter');
  greeting.setLastName('tom');

  request.setGreeting(greeting);

  client.greet(request, (error, response) => {
    if (!error) {
      console.log('greeting response: ', response.getResult());
    } else {
      console.error(error);
    }
  });
}

function callGreetManyTimes() {
  // Created our server client
  var client = new service.GreetServiceClient(
    'localhost:50051',
    grpc.credentials.createInsecure()
  );

  // create request

  var request = new greets.GreetManyTimesRequest();

  var greeting = new greets.Greeting();
  greeting.setFirstName('Paulo');
  greeting.setLastName('Dichone');

  request.setGreeting(greeting);

  var call = client.greetManyTimes(request, () => {});

  call.on('data', response => {
    console.log('Client Streaming Response: ', response.getResult());
  });

  call.on('status', status => {
    console.log(status.details);
  });

  call.on('error', error => {
    console.error(error.details);
  });

  call.on('end', () => {
    console.log('Streaming Ended!');
  });
}

function callLongGreeting() {
  var client = new service.GreetServiceClient(
    'localhost:50051',
    grpc.credentials.createInsecure()
  );
  var request = new greets.LongGreetRequest();

  var call = client.longGreet(request, (error, response) => {
    if (!error) {
      console.log('server response ', response.getResult());
    } else {
      console.log(error);
    }
  });

  let count = 0,
    intervalID = setInterval(() => {
      console.log('sending message ' + count);

      var request = new greets.LongGreetRequest();
      var greeting = new greets.Greeting();
      greeting.setFirstName('bill');
      greeting.setLastName('wondo');

      request.setGreet(greeting);

      call.write(request);

      if (++count > 3) {
        clearInterval(intervalID);
        call.end();
      }
    }, 1000);
}

function callComputeAverage() {
  var client = new calcService.CalculatorServiceClient(
    'localhost:50051',
    grpc.credentials.createInsecure()
  );

  var request = new calc.ComputeAverageRequest();

  var call = client.computeAverage(request, (error, response) => {
    if (!error) {
      console.log(
        'Received a response from the server - Average: ' +
          response.getAverage()
      );
    } else {
      console.error(error);
    }
  });

  // var request = new calc.ComputeAverageRequest();
  // // request.setNumber(1)

  for (var i = 0; i < 2000; i++) {
    var request = new calc.ComputeAverageRequest();
    request.setNumber(i);
    call.write(request);
  }

  call.end();
}

function main() {
  // greet()
  // callGreetManyTimes()
  // callPrimeNumberDecomposition();
  // callSum()
  // callLongGreeting();
  // callComputeAverage();
  // callBiDirect();
  callFindMaximum();
}

main();
