import { HttpEvent, HttpHandler, HttpHeaders, HttpInterceptor, HttpRequest } from "@angular/common/http";
import { NEVER, Observable } from "rxjs";
import { switchMap } from "rxjs/operators";
import { CONFIG_URL } from "../config/config.service";
import { AuthService, TOKEN_URL } from "../services/auth.service";

export const AUTH_HEADER_PROPERTY_NAME = "Authorization";
export const AUTH_BEARER_PREFIX = "Bearer";

/**
 * Interceptor which adds a bearer token for authorization to the httpheaders if necessary
 */
export class BearerTokenInterceptor implements HttpInterceptor {

    constructor(private authService: AuthService) { }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        if (request.url == CONFIG_URL || this.checkBasic(request.headers) || this.checkBearer(request.headers)
            || request.url.endsWith(TOKEN_URL)) {

            console.debug(`BearerTokenInterceptor: call url without adding bearer: ${request.url}`);
            return next.handle(request);
        }

        console.debug(`BearerTokenInterceptor: call url with adding bearer: ${request.url}`);

        return this.authService.hasValidUser().pipe(switchMap(
            (data, index) => {
                console.debug(`BearerTokenInterceptor: check has valid user: ${data}`);
                if (data) {
                    request = request.clone({ headers: request.headers.set(AUTH_HEADER_PROPERTY_NAME, `${AUTH_BEARER_PREFIX} ${this.authService.getToken()}`) });
                    return next.handle(request);
                }
                console.debug("BearerTokenInterceptor: clear tokens and redirect to login");
                this.authService.clearTokensAndLogin();
                return NEVER;
            }
        ));
    }

    /**
     * Checks whether the headers contain basic authorization or not
     * @param headers headeres to check
     * @returns true if the headers contain basic authorization. Otherwise false
     */
    private checkBasic(headers: HttpHeaders): boolean {
        return this.checkHeaderProperty(headers, AUTH_HEADER_PROPERTY_NAME, 'Basic ');
    }

    /**
     * Checks whether the headers already contain bearer authorization or not
     * @param headers headeres to check
     * @returns true if the headers contain bearer authorization. Otherwise false
     */
    private checkBearer(headers: HttpHeaders): boolean {
        return this.checkHeaderProperty(headers, AUTH_HEADER_PROPERTY_NAME, 'Bearer ');
    }

    /**
     * Checks whether the headers contains a property and starts with a given value or not
     * @param headers headeres to check
     * @returns true if the headers contains the property and starts with the given value. Otherwise false
     */
    private checkHeaderProperty(headers: HttpHeaders, propertyName: string, propertyValueBegin: string) {
        if (!headers.has(propertyName)) {
            return false;
        }
        let headerProperty = headers.get(propertyName);
        return headerProperty != undefined && headerProperty.startsWith(propertyValueBegin);
    }
}
