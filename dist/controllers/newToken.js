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
Object.defineProperty(exports, "__esModule", { value: true });
const jwt_1 = require("../libs/jwt");
const User_1 = require("../models/User");
const DeletedToken_1 = require("../models/DeletedToken");
const deleteOldToken_1 = require("../libs/deleteOldToken");
const newToken = (token, email) => __awaiter(void 0, void 0, void 0, function* () {
    //token erneuern
    const user = yield User_1.User.findOne({ email: email });
    if (!user) {
        throw new Error("no user found at building new token!");
    }
    //altes token speichern
    yield DeletedToken_1.DeletedToken.create({ token: token });
    //abgelaufene alte token loeschen
    (0, deleteOldToken_1.deleteOldToken)();
    const newToken = (0, jwt_1.createJwt)(user.email);
    return newToken;
});
exports.default = newToken;
