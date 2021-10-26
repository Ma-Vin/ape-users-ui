import { Message } from "./message";
import { Status } from "./status.model";

/**
 * Wrapper class to provide the response, status and messages
 */
export interface ResponseWrapper {
    /**
     * effective response object
     */
    response: Object | undefined;
    /**
     * Aggregated severity of messages
     */
    status: Status;
    /**
     * Collection of messages
     */
    messages: Message[];
}
