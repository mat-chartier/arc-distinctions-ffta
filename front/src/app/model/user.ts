export interface User {
    id: string;           // UID Firebase
    noLicence: string;
    nom: string;
    prenom: string;
    role: 'admin' | 'archer';
    email?: string;
    token?: string;
}