import {Foo} from "./Foo";
import {injectable} from "tsyringe";

@injectable()
export class Bar {
  constructor(public myFoo: Foo) {}
}
