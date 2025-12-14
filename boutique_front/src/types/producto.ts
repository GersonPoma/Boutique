export enum Marca {
    NIKE = 'NIKE',
    NEW_BALANCE = 'NEW BALANCE',
    CAT = 'CAT',
    LEE = 'LEE',
    SKECHERS = 'SKECHERS',
    CONVERSE = 'CONVERSE',
    ADIDAS = 'ADIDAS',
    PUMA = 'PUMA',
    CREP_PROTECT = 'CREP PROTECT',
    DKNY = 'DKNY',
    UNDER_ARMOUR = 'UNDER ARMOUR',
    REEBOK = 'REEBOK',
    LEVIS = 'LEVIS',
    EVERLAST = 'EVERLAST'
}

export enum Genero {
    HOMBRE = 'HOMBRE',
    MUJER = 'MUJER',
    NINO = 'NIÑO',
    NINA = 'NIÑA',
    UNISEX = 'UNISEX'
}

export enum TipoPrenda {
    CAMISETA = 'CAMISETA',   // Superior
    CAMISA = 'CAMISA',
    BLUSA = 'BLUSA',
    SUDADERA = 'SUDADERA',
    SUETER = 'SUETER',
    PANTALON = 'PANTALON',   // Inferior
    FALDA = 'FALDA',
    SHORT = 'SHORT',
    LEGGIN = 'LEGGIN',
    JEANS = 'JEANS',
    VESTIDO = 'VESTIDO',
    CHAQUETA = 'CHAQUETA',
    ABRIGO = 'ABRIGO',
    SUJETADOR = 'SUJETADOR',  // Ropa interior
    BOXER = 'BOXER',
    CALZONCILLO = 'CALZONCILLO',
    TANGA = 'TANGA',
    LENCERIA = 'LENCERIA',
    BUFANDA = 'BUFANDA',    // Accesorios
    SOMBRERO = 'SOMBRERO',
    GUANTES = 'GUANTES',
    BOLSO = 'BOLSO',
    ZAPATOS = 'ZAPATOS',    // Calzado
    BOTAS = 'BOTAS',
    SANDALIAS = 'SANDALIAS',
    ZAPATILLAS = 'ZAPATILLAS',
    BIKINI = 'BIKINI',     // Ropa de baño
    BANADOR = 'BAÑADOR',
}

export enum Talla {
    XS = 'XS',
    S = 'S',
    M = 'M',
    L = 'L',
    XL = 'XL',
    XXL = 'XXL',
    XXXL = 'XXXL',
    TALLA_UNICA = 'TALLA UNICA',
    // Tallas para calzado en números en USA
    NUM_6 = '6',
    NUM_7 = '7',
    NUM_7_5 = '7.5',
    NUM_8 = '8',
    NUM_8_5 = '8.5',
    NUM_9 = '9',
    NUM_9_5 = '9.5',
    NUM_10 = '10',
    NUM_11 = '11'
}

export enum Temporada {
    PRIMAVERA = 'PRIMAVERA',
    VERANO = 'VERANO',
    OTONO = 'OTOÑO',
    INVIERNO = 'INVIERNO'
}

export enum Estilo {
    CASUAL = 'CASUAL',
    FORMAL = 'FORMAL',
    DEPORTIVO = 'DEPORTIVO',
    ELEGANTE = 'ELEGANTE',
    VINTAGE = 'VINTAGE',
    BOHEMIO = 'BOHEMIO',
    ROCKERO = 'ROCKERO',
    URBANO = 'URBANO',
    PREPPY = 'PREPPY',
    MINIMALISTA = 'MINIMALISTA',
    NOCTURNO = 'NOCTURNO'
}

export enum Material {
    ALGODON = 'ALGODON',
    LINO = 'LINO',
    LANA = 'LANA',
    SEDA = 'SEDA',
    CUERO = 'CUERO',
    DENIM = 'DENIM',  // Jeans
    POLIESTER = 'POLIESTER',
    NYLON = 'NYLON',
    VISCOSA = 'VISCOSA',
    LYCRA = 'LYCRA',
    RAYON = 'RAYON',
    CACHEMIRA = 'CACHEMIRA',
    TERCIOPELO = 'TERCIOPELO',
    ACRILICO = 'ACRILICO'
}

export enum Uso {
    DIARIO = 'DIARIO',
    OCASIONAL = 'OCASIONAL',
    DEPORTIVO = 'DEPORTIVO',
    FORMAL = 'FORMAL',
    FIESTA = 'FIESTA'
}

export interface Producto {
    id: number | null;
    nombre: string;
    precio: number;
    imagenUrl: string;
    marca: Marca | null;
    genero: Genero | null;
    tipoPrenda: TipoPrenda | null;
    talla: Talla | null;
    temporada: Temporada | null;
    estilo: Estilo | null;
    material: Material | null;
    uso: Uso | null;
}