const supportedLanguages = [
    {
        name: 'English'
        , code: 'en'
    }
    , {
        name: 'Portuguese'
        , code: 'pt'
    }
    , {
        name: 'Spanish'
        , code: 'es'
    }
];

const translations = {
    en: {
        upcoming: 'Upcoming'
        , taskTitle: 'Task title'
        , settings: 'Settings'
        , about: 'About'
        , signIn: 'Sign In'
        , signUp: 'Sign Up'
        , signOut: 'Sign Out'
        , email: 'Email'
        , password: 'Password'
        , repeatPassword: 'Repeat Password'
        , english: 'English'
        , portuguese: 'Portuguese'
        , spanish: 'Spanish'
        , language: 'Language'
        , version: 'Version'
        , appDescription: 'Todos & Daily Planner'
    }
    , pt: {
        upcoming: 'Próximas'
        , taskTitle: 'Título'
        , settings: 'Definições'
        , about: 'Sobre'
        , signIn: 'Entrar'
        , signUp: 'Criar conta'
        , signOut: 'Sair'
        , email: 'Email'
        , password: 'Palavra passe'
        , repeatPassword: 'Repetir Palavra passe'
        , english: 'Inglês'
        , portuguese: 'Português'
        , spanish: 'Espanhol'
        , language: 'Idioma'
        , version: 'Versão'
        , appDescription: 'Tarefas & Planeamento diário'
    }
    , es: {
        upcoming: 'Próximas'
        , taskTitle: 'Título'
        , settings: 'Ajustes'
        , about: 'Acerca de'
        , signIn: 'Iniciar sesión'
        , signUp: 'Inscribirse'
        , signOut: 'Salir'
        , email: 'Email'
        , password: 'Contraseña'
        , repeatPassword: 'Repetir Contraseña'
        , english: 'Inglés'
        , portuguese: 'Portugués'
        , spanish: 'Español'
        , language: 'Idioma'
        , version: 'Versión'
        , appDescription: 'Tareas & Planificadora diaria'
    }
}

module.exports.SupportedLanguages = supportedLanguages;
module.exports.Translations = translations;