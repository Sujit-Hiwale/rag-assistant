import path from "path";
import fs, { existsSync } from "fs";
import { HierarchicalNSW } from "hnswlib-node";

export class VectorStore {
  index: any;
  dim: number;

  constructor(dim: number) {
    this.dim = dim;

    this.index = new HierarchicalNSW("l2", dim);
    this.index.initIndex({
      maxElements: 10000,
      efConstruction: 200,
      M: 16,
    });
  }

  add(id: number, vector: number[]) {
    this.index.addPoint(vector, id);
  }

  search(vector: number[], k: number = 3) {
    return this.index.searchKnn(vector, k);
  }

  save(fileName: string) {
    const filePath = path.join(process.cwd(), "vector_index", fileName);

    // Ensure folder exists
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Your hnswlib requires a file path, not a buffer
    this.index.writeIndex(filePath);
  }

  load(fileName: string) {
    const filePath = path.join(process.cwd(), "vector_index", fileName);
    if (!existsSync(filePath)) return false;

    // Your hnswlib reads from file path
    this.index.readIndex(filePath);
    return true;
  }
}
