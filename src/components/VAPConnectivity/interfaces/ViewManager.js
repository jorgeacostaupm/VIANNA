class ViewManager {
  constructor() {
    if (new.target === ViewManager) {
      throw new TypeError("Cannot construct ViewManager instances directly");
    }
  }

  static getInstance() {
    if (!this.instance) {
      this.instance = new this(); // Use 'new this()' to instantiate the subclass
    }
    return this.instance;
  }

  init() {
    throw new Error("Must override method");
  }

  update() {
    throw new Error("Must override method");
  }
}

export default ViewManager;
