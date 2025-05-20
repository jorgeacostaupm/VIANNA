let worker;
const createWorker = (app) => {
  console.log('starting WORKERS');

  const getWorker = () => {
    if (!worker) {
      if (app === 'compare')
        worker = new Worker(new URL('com_worker.js', import.meta.url), {
          type: 'module'
        });
      else if (app === 'evolution')
        worker = new Worker(new URL('evo_worker.js', import.meta.url), {
          type: 'module'
        });
      else if (app === 'correlation')
        worker = new Worker(new URL('corr_worker.js', import.meta.url), {
          type: 'module'
        });
      return worker;
    }
    return worker;
  };

  const sendMessageToWorker = (data) => {
    return new Promise((resolve, reject) => {
      try {
        const worker = getWorker();
        worker.onmessage = (event) => {
          const result = event.data;
          resolve(result);
        };
        worker.onerror = (error) => {
          reject(error);
        };
        worker.postMessage(data);
      } catch (error) {
        reject(error);
      }
    });
  };

  const terminateWorker = () => {
    if (worker) {
      worker.terminate();
      worker = null;
    }
  };

  return { sendMessageToWorker, terminateWorker };
};

export default createWorker;
