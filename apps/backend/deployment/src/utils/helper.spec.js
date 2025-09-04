describe('Utils Helper Functions', () => {
    describe('String utilities', () => {
        it('should format customer ID correctly', () => {
            const customerId = 'customer-123';
            const formatted = `CUST_${customerId.toUpperCase()}`;
            expect(formatted).toBe('CUST_CUSTOMER-123');
        });
        it('should validate email format', () => {
            const validEmail = 'manager@omnix.ai';
            const invalidEmail = 'invalid-email';
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            expect(emailRegex.test(validEmail)).toBe(true);
            expect(emailRegex.test(invalidEmail)).toBe(false);
        });
    });
    describe('Date utilities', () => {
        it('should format dates correctly', () => {
            const date = new Date('2025-09-01T12:00:00Z');
            const formatted = date.toISOString();
            expect(formatted).toBe('2025-09-01T12:00:00.000Z');
        });
        it('should calculate days between dates', () => {
            const date1 = new Date('2025-09-01');
            const date2 = new Date('2025-09-05');
            const diffTime = Math.abs(date2.getTime() - date1.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            expect(diffDays).toBe(4);
        });
    });
    describe('Array utilities', () => {
        it('should filter unique items', () => {
            const items = ['apple', 'banana', 'apple', 'orange', 'banana'];
            const unique = [...new Set(items)];
            expect(unique).toHaveLength(3);
            expect(unique).toEqual(['apple', 'banana', 'orange']);
        });
        it('should calculate average', () => {
            const numbers = [1, 2, 3, 4, 5];
            const average = numbers.reduce((sum, num) => sum + num, 0) / numbers.length;
            expect(average).toBe(3);
        });
    });
    describe('Environment configuration', () => {
        it('should have test environment configured', () => {
            expect(process.env.NODE_ENV).toBe('test');
        });
        it('should have JWT secret configured', () => {
            expect(process.env.JWT_SECRET).toBe('test-jwt-secret');
        });
        it('should have AWS region configured', () => {
            expect(process.env.AWS_REGION).toBe('eu-central-1');
        });
    });
});
//# sourceMappingURL=helper.spec.js.map