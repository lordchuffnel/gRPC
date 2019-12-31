const greets = require('../server/protos/greet_pb');
const service = require('../server/protos/greet_grpc_pb');

const grpc = require('grpc');

/* implements the greet grpc method */

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

function greet(call, callback) {
  const greeting = new greets.GreetResponse();

  greeting.setResult(
    'Hello ' +
      call.request.getGreeting().getFirstName() +
      ' ' +
      call.request.getGreeting().getLastName()
  );

  callback(null, greeting);
}

function main() {
  const server = new grpc.Server();
  server.addService(service.GreetServiceService, {
    greet: greet,
    greetManyTimes: greetManyTimes
  });
  server.bind('127.0.0.1:50051', grpc.ServerCredentials.createInsecure());
  server.start();

  console.log('server running on port 127.0.0.1:50051');
}

main();
