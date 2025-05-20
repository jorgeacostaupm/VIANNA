export class EmbeddingsExtractor {
  static task = 'feature-extraction';
  static model = 'Xenova/all-MiniLM-L6-v2';
  static instance = null;

  static async getInstance(progress_callback = null) {
    if (this.instance === null) {
      try {
        // Cargar el pipeline y especificar el uso del modelo local explícitamente
        this.instance = await pipeline(this.task, this.model);
        console.log('Modelo cargado desde la ruta local');
      } catch (error) {
        console.error('Error al cargar el modelo desde la ruta local:', error);
      }
    }

    return this.instance;
  }

  // Verifica si el modelo ya está cargado
  static isLoaded() {
    return this.instance != null;
  }
}

export function cosineDistance(a, b) {
  const size = Math.min(a.length, b.length);
  let [num, dem1, dem2] = [0, 0, 0];
  for (let index = 0; index < size; index++) {
    num += a[index] * b[index];

    dem1 += Math.pow(a[index], 2);
    dem2 += Math.pow(b[index], 2);
  }

  return 1 - num / (Math.sqrt(dem1) * Math.sqrt(dem2));
}

function isSignificant(node, threshold) {
  return node.height > threshold || node.children.length > 2;
}

export function quantile(data, percentile) {
  const sorted = data.slice().sort((a, b) => a - b);

  const N = sorted.length;
  const P = percentile * (N - 1);

  if (Number.isInteger(P)) {
    return sorted[P];
  }

  const lower = Math.floor(P);
  const upper = lower + 1;
  const weight = P - lower;

  return sorted[lower] * (1 - weight) + weight * sorted[upper];
}

// Función para podar el árbol
export function pruneTree(node, parent, threshold) {
  if (node.children == null) return;
  if (!isSignificant(node, threshold) && node.children.length === 2) {
    if (parent) {
      const index = parent.children.indexOf(node);
      parent.children.splice(index, 1, ...node.children);
    }
  } else {
    node.children.forEach((child) => pruneTree(child, node, threshold));
  }
}
