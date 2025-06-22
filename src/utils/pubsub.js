/**********
 *
 * pubsub.subscribe() on() add() listen()
 * pubsub.unsubscribe() off() remove() unlisten()
 * pubsub.publish() emit() announce()
 *
 * */

export const pubsub = {
  events: {},
  subscribe: function (evName, fn) {
    if (!pubsub.events[evName]) {
      pubsub.events[evName] = [];
    }
    pubsub.events[evName].push(fn);
  },
  unsubscribe: function (evName, fn) {
    console.warn(`PUBSUB: someone just UNsubscribed from ${evName}`);
    if (pubsub.events[evName]) {
      pubsub.events[evName] = pubsub.events[evName].filter((subscriber) => subscriber !== fn);
      if (pubsub.events[evName].length === 0) {
        delete pubsub.events[evName];
      }
    }
  },
  publish: function (evName, data) {
    if (pubsub.events[evName]) {
      pubsub.events[evName].forEach((fn) => fn(data));
    }
  }
};
