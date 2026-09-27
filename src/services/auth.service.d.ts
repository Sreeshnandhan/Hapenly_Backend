interface SignupInput {
    name: string;
    email: string;
    password: string;
    phone?: string;
    role?: "USER" | "ORGANIZER";
}
export declare function signup(data: SignupInput): Promise<{
    id: number;
    name: string;
    email: string;
    phone: string | null;
    role: import(".prisma/client").$Enums.UserRole;
}>;
interface LoginInput {
    email: string;
    password: string;
}
export declare function login(data: LoginInput): Promise<{
    user: {
        id: number;
        name: string;
        email: string;
        phone: string | null;
        role: import(".prisma/client").$Enums.UserRole;
    };
    token: never;
}>;
export declare function getUserById(userId: string | number): Promise<{
    id: number;
    name: string;
    email: string;
    phone: string | null;
    role: import(".prisma/client").$Enums.UserRole;
} | null>;
export {};
//# sourceMappingURL=auth.service.d.ts.map