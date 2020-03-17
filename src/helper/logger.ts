
import { logger } from '.';

function loggerPortal(level?: string, message?: string, messageOccured?: string): void {
    logger().log({
        timestamp: new Date().toJSON(),
        level,
        message,
        messageOccured
    });
}
export default loggerPortal;