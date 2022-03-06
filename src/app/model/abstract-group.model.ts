export interface IAbstractGroup {
    /**
     * Description of the group
     */
    description: string | undefined;

    /**
     * Name of the group
     */
    groupName: string;

    /**
     * Identification of the group
     */
    identification: string;

    /**
     * Begin of the validity
     */
    validFrom: Date | undefined;

    /**
     * End of the validity
     */
    validTo: Date | undefined;

    /**
     * Indicator whether this instance is loaded completly from backend or loaded in parts
     */
    isComplete: boolean;
}
