"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const userService = __importStar(require("./service"));
const schema_1 = require("./schema");
const BadRequestError_1 = require("../../error/BadRequestError");
const auth_1 = require("../../middleware/auth");
const router = express_1.default.Router();
router.post("/register", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const validatedData = schema_1.userSchema.parse(req.body);
        const { username, email, password, confirmPassword } = validatedData;
        const result = yield userService.registerUser(username, email, password, confirmPassword);
        res.status(201).json({
            message: "User registered successfully",
            user: {
                id: result.user.id,
                username: result.user.username,
                email: result.user.email,
                token: result.user.token,
            },
        });
    }
    catch (error) {
        if (error.issues &&
            Array.isArray(error.issues) &&
            error.issues.length > 0) {
            return next(new BadRequestError_1.BadRequestError(`Validation Error: ${error.issues[0].message}`));
        }
        next(error);
    }
}));
router.post("/login", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        const result = yield userService.loginUser(email, password);
        res.json(result);
    }
    catch (error) {
        next(error);
    }
}));
router.patch("/update-username", auth_1.authenticateJWT, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user || !req.user.id) {
            throw new BadRequestError_1.BadRequestError("User not authenticated.");
        }
        const userId = req.user.id;
        const validatedData = schema_1.updateUsernameSchema.parse(req.body);
        const updatedUser = yield userService.updateUsername(userId, validatedData);
        res.json({
            message: "Username updated successfully",
            user: updatedUser,
        });
    }
    catch (error) {
        if (error.issues &&
            Array.isArray(error.issues) &&
            error.issues.length > 0) {
            return next(new BadRequestError_1.BadRequestError(`Validation Error: ${error.issues[0].message}`));
        }
        next(error);
    }
}));
router.patch("/update-password", auth_1.authenticateJWT, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user || !req.user.id) {
            throw new BadRequestError_1.BadRequestError("User not authenticated.");
        }
        const userId = req.user.id;
        const validatedData = schema_1.updatePasswordSchema.parse(req.body);
        const updatedUser = yield userService.updatePassword(userId, validatedData);
        res.json({
            message: "Password updated successfully",
            user: updatedUser,
        });
    }
    catch (error) {
        if (error.issues &&
            Array.isArray(error.issues) &&
            error.issues.length > 0) {
            return next(new BadRequestError_1.BadRequestError(`Validation Error: ${error.issues[0].message}`));
        }
        next(error);
    }
}));
router.get("/me", auth_1.authenticateJWT, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user || !req.user.id) {
            throw new BadRequestError_1.BadRequestError("User not authenticated.");
        }
        const userId = req.user.id;
        const user = yield userService.getUserById(userId);
        if (!user) {
            throw new BadRequestError_1.BadRequestError("User not found.");
        }
        res.json({
            id: user.id,
            name: user.username,
            email: user.email,
        });
    }
    catch (error) {
        next(error);
    }
}));
exports.default = router;
//# sourceMappingURL=controller.js.map