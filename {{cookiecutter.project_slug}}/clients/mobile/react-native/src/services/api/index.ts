import {CounterApi} from './counter';

export class ApiService implements IService {
  private inited = false;

  counter: CounterApi;

  constructor() {
    this.counter = new CounterApi();
  }

  init = async (): PVoid => {
    if (!this.inited) {
      // your code ...

      this.inited = true;
    }
  };
}
