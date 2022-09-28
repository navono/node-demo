export class ServiceError {
  static create = (param: {
    code: number;
    msg: object | string;
  }): ServiceError => {
    const e = new ServiceError();
    e.code = param.code;
    e.msg = param.msg;
    return e;
  };

  code: number;
  msg: object | string;
}
