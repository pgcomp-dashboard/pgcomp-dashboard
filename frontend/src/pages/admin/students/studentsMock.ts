// Interfaces

export interface Student {
    id: number;
    name: string;
    email: string | null;
    area_id: number | null;
    course_id: number;
    lattes_url: string | null;
    defended_at: string | null;
}

// Mocks

export const studentMock: Student[] = [
    { id: 33, name: "Adriano Barbosa De Jesus", email: null, area_id: 5, course_id: 1, lattes_url: null, defended_at: null },
    { id: 34, name: "Alamo Carlos Cruz Da Silva", email: null, area_id: 3, course_id: 1, lattes_url: null, defended_at: null },
    { id: 35, name: "Alex Gondim Lima", email: null, area_id: 4, course_id: 1, lattes_url: null, defended_at: null },
    { id: 36, name: "Alexsandre Emanoel Gonçalves", email: null, area_id: null, course_id: 2, lattes_url: null, defended_at: null },
    { id: 37, name: "Aline Argolo De Athaydes", email: null, area_id: 3, course_id: 1, lattes_url: null, defended_at: null },
    { id: 38, name: "Allan Thales Ramos Oliveira", email: null, area_id: 3, course_id: 2, lattes_url: null, defended_at: null },
    { id: 39, name: "Amanda Almeida Da Silva Abreu", email: null, area_id: 3, course_id: 1, lattes_url: null, defended_at: null },
    { id: 40, name: "Amanda Sammer Do Nascimento Brandao", email: null, area_id: 3, course_id: 1, lattes_url: null, defended_at: null },
    { id: 41, name: "Andreas Junior Graubach", email: null, area_id: null, course_id: 2, lattes_url: null, defended_at: null },
    { id: 42, name: "Andressa Mirella Filgueiras Da Silva", email: null, area_id: 3, course_id: 1, lattes_url: null, defended_at: null },
];
