const summarize = require('./protos/sum_pb');
const service = require('./protos/sum_grpc_pb');

const grpc = require('grpc');

/* implements the greet grpc method */

function sum(call, callback) {
  const summary = new summarize.SumResponse();

  summary.setResult(
    call.request.getSummarize().getNum1() +
      call.request.getSummarize().getNum2()
  );

  callback(null, summary);
}

function main() {
  const server = new grpc.Server();
  server.addService(service.SumServiceService, { sum: sum });
  server.bind('127.0.0.1:50051', grpc.ServerCredentials.createInsecure());
  server.start();

  console.log('server running on port 127.0.0.1:50051');
}

main();
