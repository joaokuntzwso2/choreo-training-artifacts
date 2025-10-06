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
exports.deleteReservation = exports.updateReservation = exports.getReservation = exports.getReservations = exports.createReservation = exports.getAvailableRooms = exports.getAvailableRoomTypes = exports.getAllRooms = void 0;
const postgresql_1 = require("./postgresql");
/**
 * getAllRooms returns all the rooms
 * @returns Promise<Room[]>
 */
function getAllRooms() {
    return __awaiter(this, void 0, void 0, function* () {
        const client = yield (0, postgresql_1.getClient)();
        try {
            const result = yield client.query(`SELECT 
        r.number,
        jsonb_build_object(
            'id', rt.id,
            'name', rt.name,
            'guestCapacity', rt.guest_capacity,
            'price', rt.price
        ) AS type
    FROM 
        room r
    JOIN 
        room_type rt ON r.type = rt.id;`);
            return result.rows;
        }
        finally {
            client.release();
        }
    });
}
exports.getAllRooms = getAllRooms;
/**
 * getAvailableRoomTypes returns available room
 * types for a given date range for a given guest capacity.
 *
 * @param checkInDate - CheckIn Date
 * @param checkOutDate - CheckOut Date
 * @param guestCapacity - Guest capacity
 * @returns
 */
function getAvailableRoomTypes(checkInDate, checkOutDate, guestCapacity) {
    return __awaiter(this, void 0, void 0, function* () {
        const client = yield (0, postgresql_1.getClient)();
        try {
            const result = yield client.query(`SELECT rt.id, rt.name, rt.guest_capacity, rt.price
      FROM room_type rt
      WHERE rt.guest_capacity >= $1
      AND rt.id IN (
          SELECT r.type
          FROM room r
          WHERE r.type = rt.id
          AND r.number NOT IN (
              SELECT res.room
              FROM reservation res
              WHERE $2 <= res.checkout_date
              AND $3 >= res.checkin_date
          )
      );      
    `, [guestCapacity, checkInDate, checkOutDate]);
            return result.rows;
        }
        finally {
            client.release();
        }
    });
}
exports.getAvailableRoomTypes = getAvailableRoomTypes;
/**
 * getAvailableRooms returns a list of available
 * rooms for a given data range and for a given room type.
 *
 * @param checkInDate - CheckIn Date
 * @param checkOutDate - CheckOut Date
 * @param roomType - Type of the room
 * @returns
 */
function getAvailableRooms(checkInDate, checkOutDate, roomType) {
    return __awaiter(this, void 0, void 0, function* () {
        const client = yield (0, postgresql_1.getClient)();
        try {
            const result = yield client.query(`WITH room_type_id AS (
        SELECT id
        FROM room_type
        WHERE name = $1
    )
    SELECT r.number
    FROM room r
    CROSS JOIN room_type_id
    WHERE r.type = room_type_id.id
    AND r.number NOT IN (
        SELECT res.room
        FROM reservation res
        WHERE (
            $2 < res.checkout_date
            AND $3 > res.checkin_date
        )
    );
          `, [roomType, checkInDate, checkOutDate]);
            return result.rows;
        }
        finally {
            client.release();
        }
    });
}
exports.getAvailableRooms = getAvailableRooms;
/**
 * createReservation creates a reservation
 *
 * @param reservation
 * @returns
 */
function createReservation(reservation) {
    return __awaiter(this, void 0, void 0, function* () {
        const client = yield (0, postgresql_1.getClient)();
        const { id, room, checkinDate, checkoutDate, user } = reservation;
        try {
            const result = yield client.query(`INSERT INTO reservation ("id", "room", "checkin_date", "checkout_date", "user", "user_info", "created_at", "updated_at")
    VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
    `, [id, room, checkinDate, checkoutDate, user.id, user]);
            return result.rows;
        }
        finally {
            client.release();
        }
    });
}
exports.createReservation = createReservation;
/**
 * getReservations returns a list of reservations
 * for a given user.
 *
 * @param userId
 * @returns
 */
function getReservations(userId) {
    return __awaiter(this, void 0, void 0, function* () {
        const client = yield (0, postgresql_1.getClient)();
        try {
            const result = yield client.query(`SELECT 
      json_build_object(
          'id', res.id,
          'room', json_build_object(
              'number', r.number,
              'type', json_build_object(
                  'number', r.number,
                  'name', rt.name,
                  'guestCapacity', rt.guest_capacity,
                  'price', rt.price
              )
          ),
          'user', res.user_info::json,
          'checkinDate', res.checkin_date,
          'checkoutDate', res.checkout_date
      ) AS reservation
  FROM 
      reservation res
  JOIN 
      room r ON res.room = r.number
  JOIN 
      room_type rt ON r.type = rt.id
  WHERE 
      res.user = $1;
  
  `, [userId]);
            return result.rows;
        }
        finally {
            client.release();
        }
    });
}
exports.getReservations = getReservations;
/**
 * getReservation returns the reservation data for a given reservationId.
 *
 * @param reservationId
 * @returns
 */
function getReservation(reservationId) {
    return __awaiter(this, void 0, void 0, function* () {
        const client = yield (0, postgresql_1.getClient)();
        try {
            const result = yield client.query(`SELECT 
      json_build_object(
          'id', res.id,
          'room', json_build_object(
              'number', r.number,
              'type', json_build_object(
                  'number', r.number,
                  'name', rt.name,
                  'guestCapacity', rt.guest_capacity,
                  'price', rt.price
              )
          ),
          'user', res.user_info::json,
          'checkinDate', res.checkin_date,
          'checkoutDate', res.checkout_date
      ) AS reservation
  FROM 
      reservation res
  JOIN 
      room r ON res.room = r.number
  JOIN 
      room_type rt ON r.type = rt.id
  WHERE 
      res.id = $1;
    `, [reservationId]);
            if (result.rowCount == 0) {
                return null;
            }
            return result.rows[0];
        }
        finally {
            client.release();
        }
    });
}
exports.getReservation = getReservation;
/**
 * updateReservation updates the reservation.
 *
 * @param reservationId - Reservation ID
 * @param checkInDate - CheckIn date
 * @param checkOutDate- CheckOut date
 * @returns
 */
function updateReservation(reservationId, checkInDate, checkOutDate) {
    return __awaiter(this, void 0, void 0, function* () {
        const client = yield (0, postgresql_1.getClient)();
        try {
            const result = yield client.query(`UPDATE reservation
      SET "checkin_date" = $1, "checkout_date" = $2
      WHERE "id" = $3;
      `, [checkInDate, checkOutDate, reservationId]);
            return result.rows[0];
        }
        finally {
            client.release();
        }
    });
}
exports.updateReservation = updateReservation;
/**
 * deleteReservation deletes the reservation.
 *
 * @param reservationId - Reservation Id
 * @returns
 */
function deleteReservation(reservationId) {
    return __awaiter(this, void 0, void 0, function* () {
        const client = yield (0, postgresql_1.getClient)();
        try {
            const result = yield client.query(`DELETE FROM reservation
      WHERE id = $1;
      `, [reservationId]);
            return result;
        }
        finally {
            client.release();
        }
    });
}
exports.deleteReservation = deleteReservation;
