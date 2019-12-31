const greets = require('./protos/greet_pb');
const service = require('./protos/greet_grpc_pb');

const grpc = require('grpc');

/* implements the greet grpc method */

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
  server.addService(service.GreetServiceService, { greet: greet });
  server.bind('127.0.0.1:50051', grpc.ServerCredentials.createInsecure());
  server.start();

  console.log('server running on port 127.0.0.1:50051');
}

main();
