const { UseCaseListTranslations } = require("../../../../src/domain/modules/internationalization");

describe('[Internationalization]: Test List Translations Use Case', () => {

    it('Should succeed get translations for language', async () => {
        const translations = {
            name: 'Name'
            , email: 'Email'
            , password: 'Password'
        }

        const mockedUnitOfWork = jest.fn();
        const mockedInternationalizationRepository = jest.fn();
        mockedInternationalizationRepository.exists = jest.fn((unitOfWork, language) => true);
        mockedInternationalizationRepository.getTranslations = jest.fn((unitOfWork, language) => translations);

        const underTest = UseCaseListTranslations(mockedInternationalizationRepository, 'en');
        const result = await underTest.execute(mockedUnitOfWork, 'en');

        expect(result).not.toBeNull();
        expect(result).toBe(translations);
        expect(mockedInternationalizationRepository.exists.mock.calls).toHaveLength(1);
        expect(mockedInternationalizationRepository.getTranslations.mock.calls).toHaveLength(1);
    })

    it('Should succeed language not supported', async () => {
        const translations = {
            name: 'Name'
            , email: 'Email'
            , password: 'Password'
        }

        const mockedUnitOfWork = jest.fn();
        const mockedInternationalizationRepository = jest.fn();
        mockedInternationalizationRepository.exists = jest.fn((unitOfWork, language) => false);
        mockedInternationalizationRepository.getTranslations = jest.fn((unitOfWork, language) => translations);

        const underTest = UseCaseListTranslations(mockedInternationalizationRepository, 'en');
        const result = await underTest.execute(mockedUnitOfWork, 'pt');

        expect(result).not.toBeNull();
        expect(result).toBe(translations);
        expect(mockedInternationalizationRepository.exists.mock.calls).toHaveLength(1);
        expect(mockedInternationalizationRepository.getTranslations.mock.calls).toHaveLength(1);
    })

    it('Should fail, no unit of work provided', async () => {
        const mockedUnitOfWork = jest.fn();
        const mockedInternationalizationRepository = jest.fn();

        const underTest = UseCaseListTranslations(mockedInternationalizationRepository, 'en');
        await expect(async () => await underTest.execute(mockedUnitOfWork, null)).rejects.toThrow(Error);

    })

    it('Should fail, no language provided', async () => {
        const mockedInternationalizationRepository = jest.fn();

        const underTest = UseCaseListTranslations(mockedInternationalizationRepository, 'en');
        await expect(async () => await underTest.execute(null, 'en')).rejects.toThrow(Error);
    })
});