export default class _default {
    constructor({ weights, means, covariances, bufferSize }: {
        weights: any;
        means: any;
        covariances: any;
        bufferSize: any;
    });
    dimensions: any;
    clusters: any;
    weights: any;
    means: any;
    covariances: any;
    bufferSize: any;
    data: any[];
    idx: number;
    dataLength: number;
    tmpArr: Float32Array;
    cResps: any[];
    singularity: any;
    covCholeskies: any[] | null;
    covDeterminants: any;
    addPoint(point: any): void;
    runEM(iterations?: number): any;
    predict(point: any): any[];
    predictNormalize(point: any): any[];
}
