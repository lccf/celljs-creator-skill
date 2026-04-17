export const HomeService = Symbol('HomeService');

export interface HomeService {
    main(): Promise<string>;
    test(): Promise<any>;
}
