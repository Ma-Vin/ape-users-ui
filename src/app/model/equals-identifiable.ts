export interface IEqualsAndIdentifiable {

    /**
     * Checks whether an other object is equal to the actual one
     * @param other the other object
     * @returns true if the object eqauls the actual one (It has to be same type of  instance). Otherwise false
     */
    equals(other: any): boolean;

    /**
     * @returns the id of the object
     */
    getIdentification(): string;
}