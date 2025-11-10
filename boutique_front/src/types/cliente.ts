export interface Cliente {
    id: number | null;
    ci: string;
    nombre: string;
    apellido: string;
    fechaNacimiento: string | null;
    telefono: string | null;
    correo: string | null;
    direccion: string | null;
}