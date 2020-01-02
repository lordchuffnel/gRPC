const greets = require('../server/protos/greet_pb');
const service = require('../server/protos/greet_grpc_pb');
const grpc = require('grpc');

function callGreetManyTimes() {
  var client = new service.GreetServiceClient(
    'localhost:50051',
    grpc.credentials.createInsecure()
  );

  // create request
  let request = new greets.GreetManyTimesRequest();
  let greeting = new greets.Greeting();
  greeting.setFirstName('frank');
  greeting.setLastName('hany');

  request.setGreeting(greeting);

  let call = client.greetManyTimes(request, () => {});

  call.on('data', response => {
    console.log('client streaming response: ', response.getResult());
  });

  call.on('status', status => {
    console.log(status);
  });

  call.on('error', error => {
    console.error(error);
  });

  call.on('end', () => {
    console.log('streaming ended');
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

function main() {
  // greet()
  callGreetManyTimes();
}

main();
