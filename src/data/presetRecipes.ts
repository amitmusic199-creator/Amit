import { ModelRecipeConfig } from '../types/recipe';

export const YOLOV8N_COCO_RECIPE: ModelRecipeConfig = {
  modelName: 'yolov8n-coco',
  task: 'detection',
  upstreamModel: 'ultralytics yolov8n.pt @ 8.1.0',
  dataset: 'COCO',
  license: 'AGPL-3.0',
  backend: 'axrelay',
  inputSize: [1, 3, 640, 640],
  numCal: 200,
  weightFormat: 'onnx',
  sources: {
    onnx: {
      kind: 'remote',
      weight_url: 'weights/yolo/object_detection/yolov8n_ultralytics_v8.1.0.onnx',
      weight_path: 'yolov8n_ultralytics_v8.1.0.onnx',
      md5: '2ec6c50f5cb0e059344f4ea7f72a3c41',
    },
    pt2: {
      kind: 'remote',
      weight_url: 'weights/yolo/object_detection/yolov8n_ultralytics_v8.1.0.pt2',
      weight_path: 'yolov8n_ultralytics_v8.1.0.pt2',
      md5: '',
    },
  },
  postamble: {
    fusedKernel: 'UltralyticsYoloPostamble',
    numClasses: 80,
    dflBins: 16,
  },
  calibration: {
    url: 'https://media.axelera.ai/artifacts/data/coco/coco2017_repr416.zip',
    md5: 'a923038acd372907e8b4b811e6c069bc',
    dir: '',
  },
  accuracy: {
    task: 'detection',
    dataset: 'COCO',
    split: 'val',
    numClasses: 80,
    confThreshold: 0.001,
    iouThreshold: 0.7,
  },
  outputPath: 'build/yolov8n-coco.axm',
};

export const YOLOV8S_COCO_RECIPE: ModelRecipeConfig = {
  modelName: 'yolov8s-coco',
  task: 'detection',
  upstreamModel: 'ultralytics yolov8s.pt @ 8.1.0',
  dataset: 'COCO',
  license: 'AGPL-3.0',
  backend: 'axrelay',
  inputSize: [1, 3, 640, 640],
  numCal: 200,
  weightFormat: 'onnx',
  sources: {
    onnx: {
      kind: 'remote',
      weight_url: 'weights/yolo/object_detection/yolov8s_ultralytics_v8.1.0.onnx',
      weight_path: 'yolov8s_ultralytics_v8.1.0.onnx',
      md5: '4f29a01e5cb0e059344f4ea7f72a91a0',
    },
    pt2: {
      kind: 'remote',
      weight_url: 'weights/yolo/object_detection/yolov8s_ultralytics_v8.1.0.pt2',
      weight_path: 'yolov8s_ultralytics_v8.1.0.pt2',
      md5: '',
    },
  },
  postamble: {
    fusedKernel: 'UltralyticsYoloPostamble',
    numClasses: 80,
    dflBins: 16,
  },
  calibration: {
    url: 'https://media.axelera.ai/artifacts/data/coco/coco2017_repr416.zip',
    md5: 'a923038acd372907e8b4b811e6c069bc',
    dir: '',
  },
  accuracy: {
    task: 'detection',
    dataset: 'COCO',
    split: 'val',
    numClasses: 80,
    confThreshold: 0.001,
    iouThreshold: 0.7,
  },
  outputPath: 'build/yolov8s-coco.axm',
};

export const CUSTOM_YOLO_RECIPE: ModelRecipeConfig = {
  modelName: 'custom-yolo-detector',
  task: 'detection',
  upstreamModel: 'custom best.onnx',
  dataset: 'Custom',
  license: 'Proprietary',
  backend: 'axrelay',
  inputSize: [1, 3, 640, 640],
  numCal: 150,
  weightFormat: 'onnx',
  sources: {
    onnx: {
      kind: 'local',
      weight_url: 'file:///path/to/my_model.onnx',
      weight_path: 'my_model.onnx',
      md5: '',
    },
  },
  postamble: {
    fusedKernel: 'UltralyticsYoloPostamble',
    numClasses: 1,
    dflBins: 16,
  },
  calibration: {
    url: '',
    md5: '',
    dir: '/path/to/my_calibration_images/',
  },
  accuracy: {
    task: 'detection',
    dataset: 'Custom',
    split: 'val',
    numClasses: 1,
    confThreshold: 0.01,
    iouThreshold: 0.6,
  },
  outputPath: 'build/custom-yolo-detector.axm',
};
