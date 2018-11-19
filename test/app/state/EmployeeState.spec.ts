import { Container } from 'typescript-ioc';
import EmployeeState from '../../../src/app/state/EmployeeState';

describe('EmployeeState', () => {

    it('can be initialized', async () => {
        const employeeState = Container.get(EmployeeState);
        expect(employeeState.getAll().length).toBe(2);
    });

    it('can set an active employee', async () => {
        const employeeState = Container.get(EmployeeState);
        const employees = employeeState.getAll();

        expect(employeeState.getActive()).toBeUndefined();

        employeeState.setActive(employees[0].name);
        expect(employeeState.getActive()).toBeDefined();
        expect(employeeState.getActive().name).toBe(employees[0].name);

        employeeState.setActive('foo bar');
        expect(employeeState.getActive()).toBeUndefined();
    });
});
