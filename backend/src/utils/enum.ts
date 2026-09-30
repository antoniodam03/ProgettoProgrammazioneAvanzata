export enum Ruolo{
    operatore = 0,
    admin = 1,
}

export enum RuoloUtente{
    admin = 'admin',
    operatore = 'operatore'
}

export enum GruppoSanguigno{
    A = 'A',
    B = 'B',
    ZERO = '0',
    AB = 'AB'
}

export enum Priorita{
    normale = 'normale',
    urgente = 'urgente'
}

export enum StatoRichiesta{
    in_attesa = 'in_attesa',
    soddisfatta = 'soddisfatta',
    non_soddisfatta = 'non_soddisfatta'
}

export enum StatoPaziente{
    dimesso = 'dimesso',
    ricoverato = 'ricoverato'
}