const target: any = {};
export const simpleProxyObj = new Proxy(target, {});
simpleProxyObj.a = 37;


