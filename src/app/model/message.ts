import { Status } from "./status.model";

export interface Message {
    /**
     * Time when the message was created
     */
    time: Date;
    /**
     * Creation order
     */
    order: number;
    /**
     * Text of the message
     */
    messageText: string;
    /**
     * Severity of the message
     */
    status: Status;
}
