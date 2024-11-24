import httpStatus from 'http-status';
export class ApiResponse {
    public data!: Array<any>;
    public status_code!: number;
    public error!: any;

    constructor() {
        this.status_code = httpStatus.OK;
        this.data = [];
        this.error = null;
    }
}
