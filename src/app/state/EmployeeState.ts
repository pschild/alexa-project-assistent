import { AutoWired, Singleton } from 'typescript-ioc';

export interface IEmployee {
    id?: number;
    name: string;
    email: string;
    role?: string;
    enableEmail: boolean;
}

@AutoWired
@Singleton
export default class EmployeeState {

    private active: IEmployee;

    private employees: IEmployee[] = [];

    constructor() {
        this.employees.push({ name: 'Doe, John', email: process.env.MAIL_RECIPIENT, enableEmail: true });
        this.employees.push({ name: 'Power, Max', email: process.env.MAIL_RECIPIENT, enableEmail: false });
    }

    getAll() {
        return this.employees;
    }

    setActive(name: string) {
        this.active = this.employees.find((e) => e.name === name);
    }

    getActive() {
        return this.active;
    }

}
