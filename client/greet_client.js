const greets = require('../server/protos/greet_pb');
const service = require('../server/protos/greet_grpc_pb');
const grpc = require('grpc');

function main() {
    const client = new service.GreetServiceClient(
        'localhost:50051',
        grpc.credentials.createInsecure()
    );
    // we do stuff here
    const request = new greets.GreetRequest();
    const greeting = new greets.Greeting();
    greeting.setFirstName("peter")
    greeting.setLastName("tom")

    request.setGreeting(greeting)

    client.greet(request, (error, response) => {
        if (!error) {
            console.log("greeting response: ", response.getResult())
        } else {
            console.error(error)
        }
    })
}

main();