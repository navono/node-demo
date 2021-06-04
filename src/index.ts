import "reflect-metadata";
import {container} from "tsyringe";
import {Bar} from "./Bar";
import {Client} from "./Client";
import {TestService} from "./TestService";

const myBar = container.resolve(Bar);
console.log(myBar);

container.register("SuperService", {
  useClass: TestService
});

const client = container.resolve(Client);
client.hello('John');
