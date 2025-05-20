// Interfaces

export interface Course {
    id: number;
    name: string;
    description: string | null;
    created_at: string;
    updated_at: string;
}

// Mocks

export const courseMock: Course[] = [
    {
        id: 1,
        name: "Mestrado",
        description: null,
        created_at: "2025-04-30 13:25:38",
        updated_at: "2025-04-30 13:25:38",
    },
    {
        id: 2,
        name: "Doutorado",
        description: null,
        created_at: "2025-04-30 13:25:39",
        updated_at: "2025-04-30 13:25:39",
    },
];