/**
 * The JSON Schema sent to the API as the structured output format.
 *
 * Generated from `assistantTurnSchema` with `z.toJSONSchema`, then reduced to
 * the subset structured outputs accepts: string, number and array limits are
 * removed (the API answers 400 to them) and every object gets
 * `additionalProperties: false`. Nothing is lost: `parseAssistantTurn` still
 * enforces every limit and every `superRefine` rule on the server.
 */
import { z } from 'zod';
import { assistantTurnSchema } from '../../src/consulta/schema.js';

type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };
type JsonObject = { [key: string]: JsonValue };

/** Keywords outside the supported subset (structured outputs docs, "Not supported"). */
const ALWAYS_REMOVED = new Set([
  '$schema',
  'minLength',
  'maxLength',
  'pattern',
  'format',
  'minimum',
  'maximum',
  'exclusiveMinimum',
  'exclusiveMaximum',
  'multipleOf',
  'maxItems',
  'uniqueItems',
  'minProperties',
  'maxProperties',
]);

export interface OutputSchemaResult {
  schema: JsonObject;
  /** JSON pointers of every keyword removed, e.g. `/properties/message/minLength`. */
  removed: string[];
}

const isObject = (v: JsonValue | undefined): v is JsonObject => typeof v === 'object' && v !== null && !Array.isArray(v);

export function toApiSchema(jsonSchema: JsonObject): OutputSchemaResult {
  const removed: string[] = [];

  const visit = (node: JsonValue, path: string): JsonValue => {
    if (Array.isArray(node)) return node.map((item, i) => visit(item, `${path}/${i}`));
    if (!isObject(node)) return node;
    const out: JsonObject = {};
    for (const [key, value] of Object.entries(node)) {
      const at = `${path}/${key}`;
      const minItemsTooHigh = key === 'minItems' && typeof value === 'number' && value > 1;
      if (ALWAYS_REMOVED.has(key) || minItemsTooHigh) {
        removed.push(at);
        continue;
      }
      out[key] = visit(value, at);
    }
    if (out.type === 'object') out.additionalProperties = false;
    return out;
  };

  return { schema: visit(jsonSchema, '') as JsonObject, removed };
}

const generated = toApiSchema(z.toJSONSchema(assistantTurnSchema) as JsonObject);

/** Stable across requests, so the API's compiled-grammar cache keeps hitting. */
export const TURN_OUTPUT_SCHEMA: JsonObject = generated.schema;
export const REMOVED_KEYWORDS: readonly string[] = generated.removed;
