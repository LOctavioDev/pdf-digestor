# pdf-digestor

> **Transforma PDFs en contexto optimizado para LLMs. Menos tokens, mismo significado, menor costo.**

[![npm version](https://img.shields.io/npm/v/pdf-digestor?color=cb3837&label=npm)](https://www.npmjs.com/package/pdf-digestor)
[![License: ISC](https://img.shields.io/badge/license-ISC-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18-brightgreen)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-ready-3178c6)](https://www.typescriptlang.org)

---

## ¿Por qué existe esta librería?

Los LLMs como GPT-4 o Claude **cobran por token**. Cuando envías un PDF crudo a la API, también envías:

- Saltos de línea duplicados y espacios en blanco
- Caracteres de control y símbolos no imprimibles
- Ruido de formato del motor de extracción

`pdf-digestor` extrae el texto útil y lo transforma al formato más compacto posible para el caso de uso que necesites, **reduciendo el uso de tokens entre un 20% y un 60%** sin perder información relevante.

```
PDF crudo (8 200 tokens)  →  pdf-digestor  →  texto optimizado (3 100 tokens)
                                                 Ahorro: ~62%
```

---

## Instalación

```bash
npm install pdf-digestor
```

---

## Uso rápido

```typescript
import { PdfDigestor } from 'pdf-digestor';
import { readFileSync } from 'fs';

const digestor = new PdfDigestor();

// Desde un Buffer
const buffer = readFileSync('curriculum.pdf');
const json = await digestor
  .fromBuffer(buffer)
  .useProfile('cv')      // heurística específica para CVs
  .toFormat('json')      // salida estructurada
  .digest();

// Desde una ruta de archivo
const builder = await digestor.fromPath('factura.pdf');
const text = await builder
  .useProfile('invoice')
  .toFormat('text')      // minificación extrema
  .digest();

console.log(json);  // string JSON listo para enviar al LLM
console.log(text);  // texto plano sin ruido
```

---

## Formatos de salida

| Formato | Método | Descripción | Caso de uso |
|---------|--------|-------------|-------------|
| `text`  | `.toFormat('text')` | Minificación extrema: elimina espacios dobles, saltos múltiples y caracteres no imprimibles. Una sola línea por párrafo. | Contexto general, máximo ahorro de tokens |
| `json`  | `.toFormat('json')` | Detecta secciones automáticamente (Experience, Education, Skills…) y devuelve un JSON estructurado con `sections[]` y `raw`. | RAG, pipelines de datos, CVs, facturas |
| `md`    | `.toFormat('md')` | Convierte encabezados en ALL-CAPS a `## Headings` de Markdown. Ideal para visualización o prompts con estructura. | Chatbots, resúmenes, visualización |
| `log`   | `.toFormat('log')` | JSON de una sola línea con metadatos: páginas, conteo de palabras, preview de 200 chars y timestamp. | Observabilidad, auditoría, pipelines de logs |

---

## Perfiles disponibles

Los perfiles ajustan la heurística de detección de secciones en el formato `json`:

| Perfil | Descripción |
|--------|-------------|
| `'cv'` | Detecta secciones típicas de CV: Experience, Education, Skills, Certifications, Projects… |
| `'invoice'` | Detecta secciones de facturas: Bill To, Items, Total, Tax, Payment… |
| `'generic'` | Sin heurística de secciones. Agrupa todo el texto en bloques según mayúsculas. |

```typescript
// Perfil cv
await digestor.fromBuffer(buf).useProfile('cv').toFormat('json').digest();

// Sin perfil (por defecto: 'generic')
await digestor.fromBuffer(buf).toFormat('text').digest();
```

---

## API completa

### `new PdfDigestor()`

Crea una instancia del digestor.

### `.fromBuffer(buffer: Buffer): DigestBuilder`

Carga el PDF desde un `Buffer` en memoria.

### `await .fromPath(filePath: string): Promise<DigestBuilder>`

Carga el PDF desde una ruta del sistema de archivos.

### `.useProfile(profile: 'cv' | 'invoice' | 'generic'): DigestBuilder`

*(Opcional)* Aplica una heurística de sección específica. Por defecto: `'generic'`.

### `.toFormat(format: 'json' | 'md' | 'text' | 'log'): DigestBuilder`

Selecciona el formateador de salida.

### `await .digest(): Promise<string>`

Ejecuta la extracción y transformación. Devuelve siempre un `string`.

---

## Uso con LLMs (ejemplo con OpenAI)

```typescript
import { PdfDigestor } from 'pdf-digestor';
import OpenAI from 'openai';
import { readFileSync } from 'fs';

const client = new OpenAI();
const digestor = new PdfDigestor();

const content = await digestor
  .fromBuffer(readFileSync('report.pdf'))
  .toFormat('text')
  .digest();

const response = await client.chat.completions.create({
  model: 'gpt-4o',
  messages: [
    { role: 'system', content: 'Eres un asistente que analiza documentos.' },
    { role: 'user', content: `Analiza este documento:\n\n${content}` },
  ],
});

console.log(response.choices[0].message.content);
```

---

## Tipos TypeScript

```typescript
import type {
  OutputFormat,       // 'json' | 'md' | 'text' | 'log'
  Profile,            // 'cv' | 'invoice' | 'generic'
  JsonDigestResult,   // { profile, pages, sections[], raw }
  JsonSection,        // { title: string, content: string[] }
  LogEntry,           // { level, source, pages, charCount, wordCount, preview, format, timestamp }
} from 'pdf-digestor';
```

---

## Scripts de desarrollo

```bash
npm run build          # Compila CJS + ESM + declaraciones .d.ts
npm run dev            # Modo watch
npm test               # Ejecuta los tests
npm run test:coverage  # Tests con reporte de cobertura
npm run typecheck      # Verificación de tipos sin compilar
```

---

## Licencia

[ISC](LICENSE) © LOctavioDev
