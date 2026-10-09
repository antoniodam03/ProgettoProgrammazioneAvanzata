import { body, param, query } from 'express-validator';
import validateRequest from './validateRequestMiddleware';
import { StatoRichiesta, Priorita, GruppoSanguigno } from '../../utils/enum';

/**
 * Valori ammessi per i campi ENUM
 */
const STATI_VALIDI = Object.values(StatoRichiesta);
const PRIORITA_VALIDE = Object.values(Priorita);
const GRUPPI_VALIDI = Object.values(GruppoSanguigno);

/**
 * Valore massimo di una colonna INT di MySQL
 */
const MAX_INT = 2147483647;

/**
 * Validazione per GET /richieste (query string opzionale)
 */
export const validateGetRichieste = [
    query('stato')
        .optional()
        .isIn(STATI_VALIDI)
        .withMessage(`Lo stato deve essere uno tra: ${STATI_VALIDI.join(', ')}`),
    query('priorita')
        .optional()
        .isIn(PRIORITA_VALIDE)
        .withMessage(`La priorità deve essere una tra: ${PRIORITA_VALIDE.join(', ')}`),
    query('gruppo_sanguigno')
        .optional()
        .isIn(GRUPPI_VALIDI)
        .withMessage(`Il gruppo sanguigno deve essere uno tra: ${GRUPPI_VALIDI.join(', ')}`),
    validateRequest,
];

/**
 * Validazione per GET /richieste/:id
 */
export const validateGetRichiestaById = [
    param('id').isInt({ min: 1 }).withMessage("L'ID deve essere un intero positivo"),
    validateRequest,
];

/**
 * Validazione per POST /richieste
 */
export const validateCreateRichiesta = [
    body('id_paziente')
        .isInt({ min: 1 })
        .withMessage("id_paziente deve essere un intero positivo"),
    body('quantita')
        .notEmpty()
        .isInt({ min: 1, max: MAX_INT })
        .withMessage(`La quantità deve essere un intero compreso tra 1 e ${MAX_INT}`),
    body('priorita')
        .notEmpty()
        .isIn(PRIORITA_VALIDE)
        .withMessage(`La priorità deve essere una tra: ${PRIORITA_VALIDE.join(', ')}`),
    validateRequest,
];

/**
 * Validazione per DELETE /richieste/:id
 */
export const validateAnnullaRichiesta = [
    param('id').isInt({ min: 1 }).withMessage("L'ID deve essere un intero positivo"),
    validateRequest,
];
