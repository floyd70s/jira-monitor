export const WEEKS_ACTIVE_THRESHOLD = 4;
export const WEEKS_WARNING_THRESHOLD = 6;

export const GEMINI_MODEL = 'gemini-2.5-flash';

export const MOCK_DATA_PROMPT = `
Genera una lista JSON de 25 usuarios ficticios para el sistema Jira de una empresa llamada "Gasco".
Los usuarios deben tener nombres realistas (contexto hispano), correos corporativos (@gasco.cl), roles (Desarrollador, PO, Scrum Master, QA, Gerente) y departamentos.
Es CRUCIAL generar el campo "lastLogin" (fecha ISO 8601) con una distribución específica para probar un semáforo de actividad:
- 40% de los usuarios deben haber iniciado sesión hace menos de 4 semanas (recientes).
- 30% de los usuarios deben haber iniciado sesión entre hace 4 y 6 semanas.
- 30% de los usuarios deben haber iniciado sesión hace más de 6 semanas o tener "lastLogin": null (nunca).
Devuelve SOLO el array JSON crudo, sin markdown.
`;
