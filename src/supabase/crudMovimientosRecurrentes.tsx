import { Database, supabase } from '../index';
import { movimientoInsertSchema } from '../schemas/movimiento.schema';
import { logger } from '../utils/logger';
import { showErrorMessage, showSuccessMessage } from '../utils/messages';
import { z } from 'zod';

type MovimientoInsert = Database['public']['Tables']['movimientos']['Insert'];

/**
 * Bulk-inserts multiple movimientos into Supabase.
 * Each item is validated individually with the Zod insert schema before the
 * single batch insert is executed.
 */
export const InsertarMovimientosMasivo = async (
  items: MovimientoInsert[]
): Promise<void> => {
  try {
    if (!items.length) {
      logger.error('No se proporcionaron movimientos para la inserción masiva');
      showErrorMessage('Es necesario registrar al menos un movimiento recurrente.');
      throw new Error('No se proporcionaron movimientos para insertar.');
    }

    // Validate every item before sending to Supabase
    const validados = items.map((item, idx) => {
      try {
        return movimientoInsertSchema.parse(item);
      } catch (err) {
        if (err instanceof z.ZodError) {
          const msg = err.issues.map((e) => e.message).join(', ');
          throw new Error(`Item ${idx + 1}: ${msg}`);
        }
        throw err;
      }
    });

    const { error } = await supabase.from('movimientos').insert(validados);
    if (error) throw error;

    logger.info('Movimientos recurrentes creados exitosamente', {
      cantidad: items.length,
    });
    showSuccessMessage(
      `Se registraron ${items.length} movimiento(s) recurrente(s).`
    );
  } catch (error) {
    logger.error('Error al insertar movimientos masivos', { error });
    showErrorMessage(
      'No se pudieron registrar los movimientos. Por favor, intenta nuevamente.'
    );
    throw error;
  }
};
