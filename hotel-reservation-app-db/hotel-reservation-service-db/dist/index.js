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
exports.roomReservations = exports.rooms = void 0;
const express_1 = __importDefault(require("express"));
const util_1 = require("./util");
const uuid_1 = require("uuid");
const cors_1 = __importDefault(require("cors"));
const dao_1 = require("./dao");
const app = (0, express_1.default)();
const router = express_1.default.Router();
const port = 4000;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
exports.rooms = (0, util_1.getAllRooms)();
exports.roomReservations = {};
// POST /api/reservations
router.post("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const payload = req.body;
        console.log("Request received by POST /reservations", payload);
        // Check if room is available for the given dates
        const availableRooms = yield (0, dao_1.getAvailableRooms)(payload.checkinDate, payload.checkoutDate, payload.roomType);
        if (availableRooms.length == 0) {
            return res.status(400).send({
                http: "NotFound",
                body: "No rooms available for the given dates and type",
            });
        }
        // Create a new reservation
        const reservation = {
            id: (0, uuid_1.v4)(),
            user: payload.user,
            room: availableRooms[0].number,
            checkinDate: payload.checkinDate,
            checkoutDate: payload.checkoutDate,
        };
        yield (0, dao_1.createReservation)(reservation);
        console.log("Reservation created successfully", reservation);
        res.json(reservation);
    }
    catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
}));
// GET /api/reservations/roomTypes
router.get("/roomTypes", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("Request received by GET /reservations/roomTypes", req.query);
    const { checkinDate, checkoutDate, guestCapacity } = req.query;
    // Validate query parameters
    if (!checkinDate || !checkoutDate || !guestCapacity) {
        return res.status(400).json({ error: "Missing required parameters" });
    }
    // Call the function to get available room types
    try {
        const roomTypes = yield (0, dao_1.getAvailableRoomTypes)(checkinDate.toString(), checkoutDate.toString(), parseInt(guestCapacity.toString(), 10));
        res.json(roomTypes);
    }
    catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
}));
// GET /api/reservations/users/:userId
router.get("/users/:userId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.params.userId;
        const reservations = yield (0, dao_1.getReservations)(userId);
        const resp = reservations.map((reservation) => reservation.reservation);
        return res.json(resp);
    }
    catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
}));
// PUT /api/reservations/:reservationId
router.put("/:reservationId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const reservationId = req.params.reservationId;
        const { checkinDate, checkoutDate } = req.body;
        const reservation = yield (0, dao_1.getReservation)(reservationId);
        if (reservation == null) {
            res.json({ http: "NotFound", body: "Reservation not found" });
        }
        else {
            const rooms = yield (0, dao_1.getAvailableRooms)(checkinDate, checkoutDate, reservation.reservation.room.type.name);
            if (rooms.length == 0) {
                res.json({ http: "NotFound", body: "No rooms available" });
            }
            const updatedReservation = yield (0, dao_1.updateReservation)(reservation.reservation.id, checkinDate, checkoutDate);
            res.json(updatedReservation);
        }
    }
    catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
}));
// DELETE /api/reservations/:reservationId
router.delete("/:reservationId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const reservationId = req.params.reservationId;
        yield (0, dao_1.deleteReservation)(reservationId);
        res.sendStatus(200);
    }
    catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
}));
app.use("/api/reservations", router);
app.listen(port, () => {
    console.log(`[server]: Server is running at http://localhost:${port}`);
});
