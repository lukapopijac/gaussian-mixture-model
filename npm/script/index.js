"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cholesky_tools_1 = __importDefault(require("cholesky-tools"));
class default_1 {
    constructor({ weights, means, covariances, bufferSize }) {
        this.dimensions = means[0].length;
        this.clusters = means.length;
        this.weights = weights ? weights.slice() : Array(this.clusters).fill(1 / this.clusters);
        this.means = means.map(mu => mu.slice());
        this.covariances = covariances.map(cov => cov.map(row => row.slice()));
        this.bufferSize = bufferSize != null ? bufferSize : 1e6;
        this.data = Array(this.bufferSize);
        this.idx = 0; // index of the next data point
        this.dataLength = 0;
        // 'tmpArr' will hold sums of cluster resp., and inverses of those sums
        this.tmpArr = new Float32Array(this.bufferSize);
        // cluster responsibilities cResps[cluster_idx][data_idx]
        this.cResps = Array(this.clusters);
        for (let k = 0; k < this.clusters; k++) {
            this.cResps[k] = new Float32Array(this.bufferSize);
        }
        this.singularity = null;
        this.covCholeskies = null; // Choleskies = plural of Cholesky :)
        this.covDeterminants = this.covariances.map(cov => cholesky_tools_1.default.determinant(cov));
    }
    addPoint(point) {
        this.data[this.idx] = point;
        this.idx++;
        if (this.idx == this.bufferSize)
            this.idx = 0;
        if (this.dataLength < this.bufferSize)
            this.dataLength++;
    }
    runEM(iterations = 1) {
        if (this.dataLength == 0)
            return;
        for (let i = 0; i < iterations; i++) {
            runExpectation.call(this);
            runMaximization.call(this);
            // calculate Cholesky decompositions of covariances
            if (this.dimensions > 3) {
                this.covCholeskies = Array(this.clusters);
                for (let k = 0; k < this.clusters; k++) {
                    this.covCholeskies[k] = cholesky_tools_1.default.cholesky(this.covariances[k]);
                }
            }
            // calculate determinants of covariances
            for (let k = 0; k < this.clusters; k++) {
                let L = this.covCholeskies && this.covCholeskies[k];
                this.covDeterminants[k] = cholesky_tools_1.default.determinant(this.covariances[k], L);
            }
            // detect singularities
            for (let k = 0; k < this.clusters; k++) {
                if (this.covDeterminants[k] <= 0) {
                    this.singularity = this.means[k];
                    return this.singularity;
                }
            }
        }
    }
    predict(point) {
        let resps = Array(this.clusters);
        for (let k = 0; k < this.clusters; k++) {
            let weight = this.weights[k];
            let mean = this.means[k];
            let cov = this.covariances[k];
            let covDet = this.covDeterminants[k];
            let covCholesky = this.covCholeskies && this.covCholeskies[k];
            resps[k] = weight * pdf(point, mean, cov, covDet, covCholesky);
        }
        return resps;
    }
    predictNormalize(point) {
        let resps = this.predict(point);
        let s = 0;
        for (let k = 0; k < this.clusters; k++)
            s += resps[k];
        let sInv = 1 / s;
        for (let k = 0; k < this.clusters; k++)
            resps[k] *= sInv;
        return resps;
    }
}
exports.default = default_1;
;
function runExpectation() {
    this.tmpArr.fill(0, 0, this.dataLength);
    for (let k = 0; k < this.clusters; k++) {
        let resps = this.cResps[k];
        let weight = this.weights[k];
        let mean = this.means[k];
        let cov = this.covariances[k];
        let covDet = this.covDeterminants[k];
        let covCholesky = this.covCholeskies && this.covCholeskies[k];
        for (let i = 0; i < this.dataLength; i++) {
            this.tmpArr[i] += resps[i] = weight * pdf(this.data[i], mean, cov, covDet, covCholesky);
        }
    }
    for (let i = 0; i < this.dataLength; i++)
        this.tmpArr[i] = 1 / this.tmpArr[i];
    for (let k = 0; k < this.clusters; k++) {
        let resps = this.cResps[k];
        for (let i = 0; i < this.dataLength; i++) {
            resps[i] *= this.tmpArr[i];
        }
    }
}
function runMaximization() {
    for (let k = 0; k < this.clusters; k++) {
        let resps = this.cResps[k];
        // soft count of data points in this cluster
        let softCount = 0;
        for (let i = 0; i < this.dataLength; i++) {
            softCount += resps[i];
        }
        let scInv = 1 / softCount;
        // weights
        this.weights[k] = softCount / this.dataLength;
        // means
        let mean = this.means[k].fill(0);
        for (let i = 0; i < this.dataLength; i++) {
            for (let t = 0; t < this.dimensions; t++) {
                mean[t] += resps[i] * this.data[i][t];
            }
        }
        for (let t = 0; t < this.dimensions; t++)
            mean[t] *= scInv;
        // covariances
        let cov = this.covariances[k];
        for (let t = 0; t < this.dimensions; t++)
            cov[t].fill(0);
        let diff = Array(this.dimensions);
        for (let i = 0; i < this.dataLength; i++) {
            let datum = this.data[i];
            for (let t = 0; t < this.dimensions; t++) {
                diff[t] = datum[t] - mean[t];
            }
            for (let t1 = 0; t1 < this.dimensions; t1++) {
                for (let t2 = 0; t2 < this.dimensions; t2++) {
                    cov[t1][t2] += resps[i] * diff[t1] * diff[t2];
                }
            }
        }
        for (let t1 = 0; t1 < this.dimensions; t1++) {
            for (let t2 = 0; t2 < this.dimensions; t2++) {
                cov[t1][t2] *= scInv;
            }
        }
    }
}
const ln2pi = Math.log(2 * Math.PI);
function pdf(x, mean, cov, covDet, covCholesky) {
    // covDet and covCholesky are optional parameters
    let d = typeof x == 'number' ? 1 : x.length;
    let L = covCholesky || (d > 3 ? cholesky_tools_1.default.cholesky(cov) : null);
    let detInv = covDet != null ? 1 / covDet : 1 / cholesky_tools_1.default.determinant(cov, L);
    let mah2 = xmuAxmu(cholesky_tools_1.default.inverse(cov, L), mean, x); // mahalanobis^2
    return Math.sqrt(detInv) * Math.exp(-.5 * (mah2 + d * ln2pi));
}
function xmuAxmu(A, mu, x) {
    if (typeof x == 'number')
        return A * (x - mu) * (x - mu);
    else if (x.length == 1)
        return A[0][0] * (x[0] - mu[0]) * (x[0] - mu[0]);
    else if (x.length == 2) {
        let d0 = x[0] - mu[0], d1 = x[1] - mu[1];
        return A[0][0] * d0 * d0 + (A[0][1] + A[1][0]) * d0 * d1 + A[1][1] * d1 * d1;
    }
    let s = 0, n = x.length;
    let i, j;
    for (i = 0; i < n; i++)
        for (j = 0; j < n; j++) {
            s += A[i][j] * (x[i] - mu[i]) * (x[j] - mu[j]);
        }
    return s;
}
