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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const logger_1 = require("./middelwares/logger");
const mail_1 = require("./mail");
const db_1 = require("./db");
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT || 3000;
app.set('view engine', 'ejs');
app.set('views', './mail-views');
app.use(logger_1.logger);
app.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = yield db_1.db.query.usersTable.findMany();
        res.json({
            data,
        });
    }
    catch (error) {
        console.error('Error fetching posts:', error);
        res.status(500).json({
            error: 'An error occurred while fetching posts. Please try again later.',
        });
    }
}));
app.get('/1', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.send('hallo 1');
}));
app.get('/email/isams', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield (0, mail_1.sendMail)();
        res.send('Email sent successfully!');
    }
    catch (error) {
        res.status(500).send('Failed to send email');
    }
}));
app.listen(port, () => {
    console.log(`[server]: Server is running at http://localhost:${port}`);
});
