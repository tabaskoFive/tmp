"use strict";
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
var RTE = __importStar(require("fp-ts/lib/ReaderTaskEither"));
var E = __importStar(require("fp-ts/lib/Either"));
var dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
var app_1 = require("./app");
RTE.run(app_1.app, process.env)
    .then(E.fold(function (e) { return console.log(e); }, function (_) { return console.log('ura'); }));
