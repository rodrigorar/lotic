const { UseCaseListAvailableLanguages, Language } = require("../../../../src/domain/modules/internationalization");

describe('[Internationalization]: Test List Languages Use Case', () => {

    it('Should succeed list all languages', async () => {
        const repoResult = [
            new Language('English', 'en')
            , new Language('Portuguese', 'pt')
            , new Language('Spanish', 'es')
        ];

        const mockedUnitOfWork = jest.fn();
        const mockedInternationalizationRepository = jest.fn();
        mockedInternationalizationRepository.list = jest.fn(async (unitOfWork) => Promise.resolve(repoResult));

        const underTest = UseCaseListAvailableLanguages(mockedInternationalizationRepository);
        const result = await underTest.execute(mockedUnitOfWork);

        expect(result).not.toBeNull();
        expect(result.length).toBe(repoResult.length);
        expect(mockedInternationalizationRepository.list.mock.calls).toHaveLength(1);
    })

    it('Should succeed single language list', async () => {
        const repoResult = [new Language('English', 'en')];

        const mockedUnitOfWork = jest.fn();
        const mockedInternationalizationRepository = jest.fn();
        mockedInternationalizationRepository.list = jest.fn(async (unitOfWork) => Promise.resolve(repoResult));

        const underTest = UseCaseListAvailableLanguages(mockedInternationalizationRepository);
        const result = await underTest.execute(mockedUnitOfWork);

        expect(result).not.toBeNull();
        expect(result.length).toBe(repoResult.length);
        expect(mockedInternationalizationRepository.list.mock.calls).toHaveLength(1);
    })

    it('Should suceed no languages list', async () => {
        const repoResult = [];

        const mockedUnitOfWork = jest.fn();
        const mockedInternationalizationRepository = jest.fn();
        mockedInternationalizationRepository.list = jest.fn(async (unitOfWork) => Promise.resolve(repoResult));

        const underTest = UseCaseListAvailableLanguages(mockedInternationalizationRepository);
        const result = await underTest.execute(mockedUnitOfWork);

        expect(result).not.toBeNull();
        expect(result.length).toBe(repoResult.length);
        expect(mockedInternationalizationRepository.list.mock.calls).toHaveLength(1);
    })

    it('Should fail, not unit of work provided', async () => {
        const mockedInternationalizationRepository = jest.fn();

        const underTest = UseCaseListAvailableLanguages(mockedInternationalizationRepository);
        await expect(async () => await underTest.execute(null)).rejects.toThrow(Error);
    })
})