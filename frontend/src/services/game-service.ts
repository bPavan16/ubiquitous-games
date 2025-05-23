import axios from "axios";
import { useAuthStore } from "@/store/auth-store";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

class GameService {
    static async getGames(filters = {}) {
        try {
            const params = new URLSearchParams();
            Object.entries(filters).forEach(([key, value]) => {
                params.append(key, String(value));
            });

            const response = await axios.get(`${API_URL}/games?${params.toString()}`);
            return response.data.data;
        } catch (error: any) {
            throw new Error(error.response?.data?.message || "Failed to fetch games");
        }
    }

    static async getGame(id: string) {
        try {
            const response = await axios.get(`${API_URL}/games/${id}`);
            return response.data.data;
        } catch (error: any) {
            throw new Error(error.response?.data?.message || "Failed to fetch game");
        }
    }

    static async createGame(gameData: any) {
        const token = useAuthStore.getState().token;

        try {
            const response = await axios.post(`${API_URL}/games`, gameData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            return response.data.data;
        } catch (error: any) {
            throw new Error(error.response?.data?.message || "Failed to create game");
        }
    }

    static async joinGame(id: string) {
        const token = useAuthStore.getState().token;

        try {
            const response = await axios.put(
                `${API_URL}/games/${id}/join`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            return response.data.data;
        } catch (error: any) {
            throw new Error(error.response?.data?.message || "Failed to join game");
        }
    }

    static async getMyGames() {
        const token = useAuthStore.getState().token;

        try {
            const response = await axios.get(`${API_URL}/games/my/games`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            return response.data.data;
        } catch (error: any) {
            throw new Error(error.response?.data?.message || "Failed to fetch your games");
        }
    }
}

export default GameService;