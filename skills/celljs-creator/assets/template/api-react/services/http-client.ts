import { Autowired, Service, Value } from '@celljs/core';
import { RestOperations, RestOperationsFactory } from '@celljs/http';

@Service()
export class HttpClient {
    @Value('cell.server.path')
    path: string;

    @Autowired(RestOperationsFactory)
    clientFactory: RestOperationsFactory;

    _client: RestOperations;
    get client() {
        if (!this._client) {
            this._client = this.clientFactory.create();
        }
        return this._client;
    }

    get<T = any>(url: string, params = {}) {
        return this.client.get<T>(url, { params })
            .then(res => res.data);
    }

    post<T = any>(url: string, params = {}) {
        return this.client.post<T>(url, params)
            .then(res => res.data);
    }

    put<T = any>(url: string, params = {}) {
        return this.client.put<T>(url, params)
            .then(res => res.data);
    }

    delete<T = any>(url: string, params = {}) {
        return this.client.delete<T>(url, { params })
            .then(res => res.data);
    }
}
