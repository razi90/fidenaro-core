import UserInfo from './UserInfo.json';
import DefaultUserInfo from './DefaultUserInfo.json';
import { AppUser } from '../entities/User';

export async function fetchUserInfo(): Promise<AppUser> {
    await new Promise((resolve) => setTimeout(resolve, 2000)); // Delay for simulation
    try {
        const user = new AppUser(UserInfo);
        return user;
    } catch (error) {
        console.error('Error fetching user info:', error);
        const user = new AppUser(DefaultUserInfo);
        return user;
    }
}