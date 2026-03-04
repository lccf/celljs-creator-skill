import { Autowired, Component, Value } from '@celljs/core';
import { HomeService } from './home-protocol';
import { HttpClient } from './http-client';

@Component(HomeService)
export class HomeServiceImpl implements HomeService {
    @Value('cell.server.path')
    path: string;

    @Autowired()
    http: HttpClient;

    main() {
        let url = `${this.path}home`;
        return this.http.get<string>(url);
    }

    test() {
        let url = `${this.path}home/test`;
        return this.http.post<{data: string}>(url);
    }
}
