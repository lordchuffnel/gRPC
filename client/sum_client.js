const summarize = require('../server/protos/sum_pb');
const service = require('../server/protos/sum_grpc_pb');

const grpc = require('grpc');

function main() {
  const client = new service.SumServiceClient(
    'localhost:50051',
    grpc.credentials.createInsecure()
  );

  const request = new summarize.SumRequest();
  const summary = new summarize.Summarize();
  summary.setNum1(1);
  summary.setNum2(2);

  request.setSummarize(summary);

  client.sum(request, (error, response) => {
    if (!error) {
      console.log('summary response: ', response.getResult());
    } else {
      console.error(error);
    }
  });
}

main();
