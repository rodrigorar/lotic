const { v4 } = require("uuid");
const { UseCaseSetLanguage } = require("../../../../src/domain/modules/internationalization");

describe('[Internationalization]: Test Set Language Use Case', () => {

    it('Should succeed updating system language', async () => {
        const mockedUnitOfWork = jest.fn();

        const mockedInternationalizatoinRepository = jest.fn();
        mockedInternationalizatoinRepository.exists = jest.fn((unitOfWork, language) => true);

        const mockedAccountsRepository = jest.fn();
        mockedAccountsRepository.setLanguage = jest.fn((unitOfWork, language) => { /* Do Nothing */ });

        const underTest = UseCaseSetLanguage(mockedInternationalizatoinRepository, mockedAccountsRepository);
        await underTest.execute(mockedUnitOfWork, v4(), 'en');

        expect(mockedInternationalizatoinRepository.exists.mock.calls).toHaveLength(1);
        expect(mockedAccountsRepository.setLanguage.mock.calls).toHaveLength(1);
    });

    it('Should fail, unsupported language', async () => {
        const mockedUnitOfWork = jest.fn();

        const mockedInternationalizatoinRepository = jest.fn();
        mockedInternationalizatoinRepository.exists = jest.fn((unitOfWork, language) => false);

        const mockedAccountsRepository = jest.fn();

        const underTest = UseCaseSetLanguage(mockedInternationalizatoinRepository, mockedAccountsRepository);
        await expect(async () => await underTest.execute(mockedUnitOfWork, v4(), 'pt')).rejects.toThrow(Error);

        expect(mockedInternationalizatoinRepository.exists.mock.calls).toHaveLength(1);
    });

    it('Should fail no language provided', async () => {
        const mockedInternationalizatoinRepository = jest.fn();
        const mockedAccountsRepository = jest.fn();

        const underTest = UseCaseSetLanguage(mockedInternationalizatoinRepository, mockedAccountsRepository);
        await expect(async () => await underTest.execute(null, v4(), language)).rejects.toThrow(Error);
    });

    it('Should fail no account id provided', async () => {
        const mockedUnitOfWork = jest.fn();
        const mockedInternationalizatoinRepository = jest.fn();
        const mockedAccountsRepository = jest.fn();

        const underTest = UseCaseSetLanguage(mockedInternationalizatoinRepository, mockedAccountsRepository);
        await expect(async () => await underTest.execute(mockedUnitOfWork, null, 'en')).rejects.toThrow(Error);
    })

    it('Should fail no unit of work provided', async () => {
        const mockedUnitOfWork = jest.fn();
        const mockedInternationalizatoinRepository = jest.fn();
        const mockedAccountsRepository = jest.fn();

        const underTest = UseCaseSetLanguage(mockedInternationalizatoinRepository, mockedAccountsRepository);
        await expect(async () => await underTest.execute(mockedUnitOfWork, v4(), null)).rejects.toThrow(Error);
    });

});