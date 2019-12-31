// GENERATED CODE -- DO NOT EDIT!

'use strict';
var grpc = require('grpc');
var protos_sum_pb = require('../protos/sum_pb.js');

function serialize_sum_SumRequest(arg) {
  if (!(arg instanceof protos_sum_pb.SumRequest)) {
    throw new Error('Expected argument of type sum.SumRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_sum_SumRequest(buffer_arg) {
  return protos_sum_pb.SumRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_sum_SumResponse(arg) {
  if (!(arg instanceof protos_sum_pb.SumResponse)) {
    throw new Error('Expected argument of type sum.SumResponse');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_sum_SumResponse(buffer_arg) {
  return protos_sum_pb.SumResponse.deserializeBinary(new Uint8Array(buffer_arg));
}


var SumServiceService = exports.SumServiceService = {
  sum: {
    path: '/sum.SumService/Sum',
    requestStream: false,
    responseStream: false,
    requestType: protos_sum_pb.SumRequest,
    responseType: protos_sum_pb.SumResponse,
    requestSerialize: serialize_sum_SumRequest,
    requestDeserialize: deserialize_sum_SumRequest,
    responseSerialize: serialize_sum_SumResponse,
    responseDeserialize: deserialize_sum_SumResponse,
  },
};

exports.SumServiceClient = grpc.makeGenericClientConstructor(SumServiceService);
