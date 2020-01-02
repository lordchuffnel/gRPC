const summarize = require('../server/protos/sum_pb');
const service = require('../server/protos/sum_grpc_pb');

const grpc = require('grpc');

function callSumManyTimes() {
  var client = new service.SumServiceClient(
    'localhost:50051',
    grpc.credentials.createInsecure()
  );

  // create request
  let request = new summarize.SumManyTimesRequest();
  var number = 56778

  request.setNumber(number);

  let call = client.sumManyTimes(request, () => {});

  call.on('data', response => {
    console.log('response: ', response.getPrimeFactor());
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

function sum() {
  const client = new service.SumServiceClient(
    'localhost:50051',
    grpc.credentials.createInsecure()
  );

  const request = new summarize.SumRequest();
  const summary = new summarize.Summarize();
  summary.setNum1(123);
  summary.setNum2(552);

  request.setSummarize(summary);

  client.sum(request, (error, response) => {
    if (!error) {
      console.log('summary response: ', response.getResult());
    } else {
      console.error(error);
    }
  });
}

function main() {
  // sum()
  callSumManyTimes();
}

main();
