import { eventBus } from './eventbus';
import { FlowService } from '../services/flowService';

/**
 * Subscriber che collega l'EventBus al FlowService.
 * Separato dall'EventBus stesso per mantenerlo disaccoppiato
 * da chi effettivamente reagisce ai suoi eventi.
 *
 */
let isProcessing = false;
let rerunRequested = false;

eventBus.on('FLUSSO_DA_RICALCOLARE', async () => {
    if (isProcessing) {
        rerunRequested = true;
        console.log('[FlowListener] Ricalcolo già in corso.');
        return;
    }

    isProcessing = true;
    try{
        do{
            rerunRequested = false;
            console.log('[FlowListener] Ricalcolo del flusso in corso...');
            await FlowService.recompute();
            console.log('[FlowListener] Ricalcolo del flusso completato.');
        }while(rerunRequested);
    }catch(error){
        console.error('[FlowListener] Errore durante il ricalcolo del flusso:', error);
    }finally{
        isProcessing = false;
    }
});