"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAvailableRoomTypes = exports.getAvailableRoom = exports.getAllocatedRooms = exports.getAllRooms = void 0;
const _1 = require(".");
function getAllRooms() {
    return [
        {
            number: 101,
            type: {
                id: 0,
                name: "Single",
                guestCapacity: 1,
                price: 80,
            },
        },
        {
            number: 102,
            type: {
                id: 0,
                name: "Single",
                guestCapacity: 1,
                price: 80,
            },
        },
        {
            number: 103,
            type: {
                id: 0,
                name: "Single",
                guestCapacity: 1,
                price: 80,
            },
        },
        {
            number: 104,
            type: {
                id: 0,
                name: "Single",
                guestCapacity: 1,
                price: 80,
            },
        },
        {
            number: 105,
            type: {
                id: 1,
                name: "Double",
                guestCapacity: 2,
                price: 120,
            },
        },
        {
            number: 106,
            type: {
                id: 1,
                name: "Double",
                guestCapacity: 2,
                price: 120,
            },
        },
        {
            number: 201,
            type: {
                id: 0,
                name: "Single",
                guestCapacity: 1,
                price: 80,
            },
        },
        {
            number: 202,
            type: {
                id: 0,
                name: "Single",
                guestCapacity: 1,
                price: 80,
            },
        },
        {
            number: 203,
            type: {
                id: 0,
                name: "Single",
                guestCapacity: 1,
                price: 80,
            },
        },
        {
            number: 204,
            type: {
                id: 1,
                name: "Double",
                guestCapacity: 2,
                price: 120,
            },
        },
        {
            number: 205,
            type: {
                id: 1,
                name: "Double",
                guestCapacity: 2,
                price: 120,
            },
        },
        {
            number: 206,
            type: {
                id: 1,
                name: "Double",
                guestCapacity: 2,
                price: 120,
            },
        },
        {
            number: 301,
            type: {
                id: 1,
                name: "Double",
                guestCapacity: 2,
                price: 120,
            },
        },
        {
            number: 302,
            type: {
                id: 1,
                name: "Double",
                guestCapacity: 2,
                price: 120,
            },
        },
        {
            number: 303,
            type: {
                id: 2,
                name: "Family",
                guestCapacity: 4,
                price: 200,
            },
        },
        {
            number: 304,
            type: {
                id: 3,
                name: "Suite",
                guestCapacity: 4,
                price: 300,
            },
        },
        {
            number: 305,
            type: {
                id: 0,
                name: "Single",
                guestCapacity: 1,
                price: 80,
            },
        },
        {
            number: 306,
            type: {
                id: 1,
                name: "Double",
                guestCapacity: 2,
                price: 120,
            },
        },
        {
            number: 401,
            type: {
                id: 0,
                name: "Single",
                guestCapacity: 1,
                price: 80,
            },
        },
        {
            number: 402,
            type: {
                id: 1,
                name: "Double",
                guestCapacity: 2,
                price: 120,
            },
        },
        {
            number: 403,
            type: {
                id: 2,
                name: "Family",
                guestCapacity: 4,
                price: 200,
            },
        },
        {
            number: 404,
            type: {
                id: 3,
                name: "Suite",
                guestCapacity: 4,
                price: 300,
            },
        },
        {
            number: 405,
            type: {
                id: 0,
                name: "Single",
                guestCapacity: 1,
                price: 80,
            },
        },
        {
            number: 406,
            type: {
                id: 3,
                name: "Suite",
                guestCapacity: 4,
                price: 300,
            },
        },
        // Add other room objects here
    ];
}
exports.getAllRooms = getAllRooms;
function getAllocatedRooms(checkinDate, checkoutDate) {
    const userCheckinUTC = new Date(checkinDate);
    const userCheckoutUTC = new Date(checkoutDate);
    const allocatedRooms = {};
    for (const reservation of Object.values(_1.roomReservations)) {
        const rCheckin = new Date(reservation.checkinDate);
        const rCheckout = new Date(reservation.checkoutDate);
        if (userCheckinUTC <= rCheckin && userCheckoutUTC >= rCheckout) {
            allocatedRooms[reservation.room.number] = reservation.room;
        }
    }
    return allocatedRooms;
}
exports.getAllocatedRooms = getAllocatedRooms;
function getAvailableRoom(checkinDate, checkoutDate, roomType) {
    const allocatedRooms = getAllocatedRooms(checkinDate, checkoutDate);
    for (const room of _1.rooms) {
        if (room.type.name === roomType &&
            (!allocatedRooms || !(room.number in allocatedRooms))) {
            return room;
        }
    }
    return null;
}
exports.getAvailableRoom = getAvailableRoom;
function getAvailableRoomTypes(checkinDate, checkoutDate, guestCapacity) {
    try {
        // Call the function to get allocated rooms
        const allocatedRooms = getAllocatedRooms(checkinDate, checkoutDate);
        console.log("allocatedRooms", allocatedRooms);
        console.log("rooms", _1.rooms);
        // Filter available room types based on guest capacity and allocated rooms
        const availableRoomTypes = _1.rooms
            .filter((room) => {
            return (room.type.guestCapacity >= guestCapacity &&
                !allocatedRooms[room.number]);
        })
            .map((room) => room.type);
        console.log("availableRoomTypes", availableRoomTypes);
        return availableRoomTypes;
    }
    catch (error) {
        throw new Error("Error occurred while fetching available room types");
    }
}
exports.getAvailableRoomTypes = getAvailableRoomTypes;
