export interface TokenResponse {
    /**
     * REQUIRED.  The access token issued by the authorization server.
     */
    access_token: string;

    /**
     * REQUIRED.  The type of the token issued as described in Section 7.1.  Value is case insensitive.
     */
    token_type: string;
    /**
     * RECOMMENDED.  The lifetime in seconds of the access token.
     * For example, the value "3600" denotes that the access token will expire in one hour from the time the response was generated.
     * If omitted, the authorization server SHOULD provide the expiration time via other means or document the default value.
     */
    expires_in: number;

    /**
     * OPTIONAL.  The refresh token, which can be used to obtain new access tokens using the same authorization grant as described in Section 6..
     */
    refresh_token: string | undefined;

    /**
     * OPTIONAL, if identical to the scope requested by the client;
     * otherwise, REQUIRED.  The scope of the access token as  described by Section 3.3.
     */
    scope: string | undefined;
}
