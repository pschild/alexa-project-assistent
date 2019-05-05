import { AutoWired, Singleton } from 'typescript-ioc';
// tslint:disable-next-line:no-var-requires
const employeeList = require('@root/demo-data/employees.json');

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
        this.employees = employeeList.map((employee) => Object.assign(employee, { email: process.env.MAIL_RECIPIENT }));
    }

    getAll(): IEmployee[] {
        return this.employees;
    }

    setActive(name: string): void {
        const result: IEmployee = this.employees.find((e) => e.name === name);
        if (result) {
            this.active = result;
        } else {
            throw new Error(`Could not find employee with name ${name}`);
        }
    }

    getActive(): IEmployee {
        return this.active;
    }

    removeActive(): void {
        this.active = undefined;
    }

}
