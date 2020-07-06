"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var io = __importStar(require("io-ts"));
var fastify_1 = __importDefault(require("fastify"));
var PathReporter_1 = require("io-ts/lib/PathReporter");
var fs_1 = require("fs");
var function_1 = require("fp-ts/lib/function");
var RTE = __importStar(require("fp-ts/lib/ReaderTaskEither"));
var TE = __importStar(require("fp-ts/lib/TaskEither"));
var E = __importStar(require("fp-ts/lib/Either"));
var O = __importStar(require("fp-ts/lib/Option"));
var Apply_1 = require("fp-ts/lib/Apply");
var TCredentials = io.type({
    redisPort: io.string,
    redisHost: io.string,
    redisDbIndex: io.string
}, 'Credentials');
var TGameConfig = io.type({
    reward: io.number,
}, 'GameConfig');
var TServerConfig = io.type({
    port: io.number,
}, 'ServerConfig');
var TConfig = io.type({
    gameConfig: TGameConfig,
    serverConfig: TServerConfig,
    credentials: TCredentials,
}, 'Config');
var validator = function (type) { return function (a) {
    return function_1.pipe(type.validate(a, io.getDefaultContext(type)), E.mapLeft(function (errs) { return new Error(PathReporter_1.PathReporter.report(E.left(errs)).join('\n')); }));
}; };
exports.readEnv = function (env) {
    // const readEnvVar = (s?: string) => E.fromNullable(new Error(msg))(s);
    var getCredentials = function (path) {
        return new Promise(function (res) { return setTimeout(function () { return res({
            redisPort: '6578',
            redisHost: '127.0.0.1',
            redisDbIndex: '0',
        }); }, 1500); });
    };
    var getGameConfig = function (path) { return fs_1.promises.readFile(path)
        .then(String)
        .then(JSON.parse); };
    var getServerConfig = function (path) { return fs_1.promises.readFile(path)
        .then(String)
        .then(JSON.parse); };
    var validateConfig = validator(TConfig);
    return function_1.pipe(Apply_1.sequenceT(TE.taskEither)(TE.fromOption(function () { return new Error('missing server config path'); })(O.fromNullable(env.SERVER_CONFIG_PATH)), TE.fromOption(function () { return new Error('missing game config path'); })(O.fromNullable(env.GAME_CONFIG_PATH)), TE.fromOption(function () { return new Error('missing SSM path'); })(O.fromNullable(env.SSM_PATH))), TE.chain(function (_a) {
        var spath = _a[0], gpath = _a[1], cpath = _a[2];
        return TE.tryCatch(function () { return Promise.all([
            getServerConfig(spath),
            getGameConfig(gpath),
            getCredentials(cpath),
        ]); }, function (r) { return new Error("read env error " + String(r)); });
    }), TE.map(function (_a) {
        var serverConfig = _a[0], gameConfig = _a[1], credentials = _a[2];
        return ({ serverConfig: serverConfig, gameConfig: gameConfig, credentials: credentials });
    }), TE.chain(function (parsed) { return TE.fromEither(validateConfig(parsed)); }));
};
exports.startServer = function (config) {
    return function (env) { return TE.tryCatch(function () { return __awaiter(void 0, void 0, void 0, function () {
        var isDevelopment, credentials, gameConfig, serverConfig, playerApi, server;
        return __generator(this, function (_a) {
            isDevelopment = env['NODE_ENV'] === 'dev';
            credentials = config.credentials, gameConfig = config.gameConfig, serverConfig = config.serverConfig;
            playerApi = function () { return ; };
            server = fastify_1.default({
                logger: isDevelopment ? console.log : null,
                disableRequestLogging: false,
            });
            server.register([playerApi]);
            return [2 /*return*/];
        });
    }); }, E.toError); };
};
exports.app = function_1.pipe(exports.readEnv, RTE.chain(exports.startServer));
