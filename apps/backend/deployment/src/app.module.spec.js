"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const app_module_1 = require("./app.module");
describe('AppModule', () => {
    let module;
    beforeEach(async () => {
        module = await testing_1.Test.createTestingModule({
            imports: [app_module_1.AppModule],
        }).compile();
    });
    it('should compile the module', () => {
        expect(module).toBeDefined();
    });
    it('should have the expected structure', () => {
        expect(module).toBeTruthy();
    });
    afterEach(async () => {
        if (module) {
            await module.close();
        }
    });
});
//# sourceMappingURL=app.module.spec.js.map