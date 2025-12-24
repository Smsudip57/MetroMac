import {logout} from "@/redux/features/authSlice";

import {decodeJwt} from "jose";

export async function verifyToken(token: string | undefined) {
    if (!token) {
        logout();
        return {isValid: false, decoded: null};
    }

    try {
        const decoded = decodeJwt(token);

        if (!decoded) {
            logout();
            return {isValid: false, decoded: null};
        }

        // Check expiration
        const currentTime = Math.floor(Date.now() / 1000);
        if (decoded.exp && decoded.exp < currentTime) {
            logout();
            return {isValid: false, decoded: null};
        }

        return {isValid: true, decoded};
    } catch (error) {
        logout();
        console.error("Token verification error:", error);
        return {isValid: false, decoded: null};
    }
}
