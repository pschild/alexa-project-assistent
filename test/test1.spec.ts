describe('test1', () => {
    beforeAll(async () => {
        console.log('beforeAll');
    });

    afterAll(async () => {
        console.log('afterAll');
    });

    beforeEach(async () => {
        console.log('beforeEach');
    });

    it('tbd', async () => {
        expect(1).toBe(1);
    });
});
