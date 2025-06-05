"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const express_1 = __importDefault(require("express"));
const controller_1 = __importDefault(require("./app/user/controller"));
const controller_2 = __importDefault(require("./app/review/controller"));
const controller_3 = __importDefault(require("./app/beach/controller"));
const logger_1 = require("./middleware/logger");
const error_1 = require("./middleware/error");
const cors_1 = __importDefault(require("cors"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
app.use((0, cors_1.default)({
    origin: "http://localhost:3000",
    credentials: true,
}));
app.use(express_1.default.json());
app.use(logger_1.logger);
app.use("/user", controller_1.default);
app.use("/review", controller_2.default);
app.use("/beach", controller_3.default);
app.use(error_1.errorHandler);
app.listen(PORT, () => console.log(`Server running on port http://localhost:${PORT}`));
//# sourceMappingURL=index.js.map