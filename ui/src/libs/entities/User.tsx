export interface User {
    account: string | undefined;
    persona: string | undefined;
    id: string;
    name: string;
    bio: string;
    avatar: string;
    twitter: string;
    telegram: string;
    discord: string;
    assets: Map<string, number>;
}