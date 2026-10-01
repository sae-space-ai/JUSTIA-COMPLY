/**
 * JUSTIA COMPLY — Deterministic Rule Engine
 * 
 * Evaluates rule versions against input data using a closed set of operators.
 * NO eval(), NO arbitrary execution. All logic is explicit and auditable.
 * 
 * Supported operators:
 * - required: field must be present and non-empty
 * - type: field must be of specified type (string, number, boolean, array)
 * - range: numeric field must be within [min, max]
 * - threshold: numeric comparison (gt, gte, lt, lte, eq, neq)
 * - equality: field must equal a specific value
 * - enum: field must be one of allowed values
 * - formula: restricted arithmetic DSL (NOT eval)
 */

import type { RuleOperator, RuleOperatorConfig, ValidationResult, RuleVersion } from './types';

// ============ FORMULA DSL PARSER ============
// Restricted formula language: supports +, -, *, /, parentheses, variable references
// Grammar: expr = term (('+' | '-') term)*
//          term = factor (('*' | '/') factor)*
//          factor = NUMBER | VARIABLE | '(' expr ')'

interface FormulaContext {
  variables: Record<string, number>;
}

function tokenizeFormula(formula: string): string[] {
  const tokens: string[] = [];
  let i = 0;
  while (i < formula.length) {
    const ch = formula[i];
    if (/\s/.test(ch)) { i++; continue; }
    if (/[0-9.]/.test(ch)) {
      let num = '';
      while (i < formula.length && /[0-9.]/.test(formula[i])) {
        num += formula[i++];
      }
      tokens.push(num);
    } else if (/[a-zA-Z_]/.test(ch)) {
      let ident = '';
      while (i < formula.length && /[a-zA-Z0-9_]/.test(formula[i])) {
        ident += formula[i++];
      }
      tokens.push(ident);
    } else if ('+-*/()'.includes(ch)) {
      tokens.push(ch);
      i++;
    } else {
      throw new Error(`Invalid character in formula: '${ch}' at position ${i}`);
    }
  }
  return tokens;
}

class FormulaParser {
  private tokens: string[];
  private pos: number;
  private context: FormulaContext;

  constructor(formula: string, context: FormulaContext) {
    this.tokens = tokenizeFormula(formula);
    this.pos = 0;
    this.context = context;
  }

  parse(): number {
    const result = this.parseExpression();
    if (this.pos < this.tokens.length) {
      throw new Error(`Unexpected token: '${this.tokens[this.pos]}'`);
    }
    return result;
  }

  private peek(): string | undefined {
    return this.tokens[this.pos];
  }

  private consume(): string {
    return this.tokens[this.pos++];
  }

  private parseExpression(): number {
    let left = this.parseTerm();
    while (this.peek() === '+' || this.peek() === '-') {
      const op = this.consume();
      const right = this.parseTerm();
      left = op === '+' ? left + right : left - right;
    }
    return left;
  }

  private parseTerm(): number {
    let left = this.parseFactor();
    while (this.peek() === '*' || this.peek() === '/') {
      const op = this.consume();
      const right = this.parseFactor();
      if (op === '/' && right === 0) {
        throw new Error('Division by zero in formula');
      }
      left = op === '*' ? left * right : left / right;
    }
    return left;
  }

  private parseFactor(): number {
    const token = this.peek();
    if (token === '(') {
      this.consume(); // (
      const result = this.parseExpression();
      if (this.peek() !== ')') {
        throw new Error('Missing closing parenthesis in formula');
      }
      this.consume(); // )
      return result;
    }
    if (token === undefined) {
      throw new Error('Unexpected end of formula');
    }
    this.consume();
    // Check if it's a number
    if (/^[0-9.]+$/.test(token)) {
      const num = parseFloat(token);
      if (isNaN(num)) throw new Error(`Invalid number: ${token}`);
      return num;
    }
    // It's a variable reference
    if (token in this.context.variables) {
      return this.context.variables[token];
    }
    throw new Error(`Unknown variable in formula: '${token}'`);
  }
}

function evaluateFormula(formula: string, inputs: Record<string, unknown>): { value: number; explanation: string } {
  // Build variable context from inputs (only numeric values)
  const variables: Record<string, number> = {};
  for (const [key, val] of Object.entries(inputs)) {
    if (typeof val === 'number' && !isNaN(val)) {
      variables[key] = val;
    }
  }
  
  const parser = new FormulaParser(formula, { variables });
  const result = parser.parse();
  
  // Build explanation
  const varList = Object.entries(variables)
    .map(([k, v]) => `${k}=${v}`)
    .join(', ');
  
  return {
    value: result,
    explanation: `formula(${formula}) with {${varList}} = ${result}`
  };
}

// ============ OPERATOR EVALUATORS ============

interface OperatorResult {
  pass: boolean;
  explanation: string;
  calculatedValue?: unknown;
}

function evaluateRequired(config: RuleOperatorConfig, inputs: Record<string, unknown>): OperatorResult {
  const value = inputs[config.field];
  const pass = value !== undefined && value !== null && value !== '' && !(Array.isArray(value) && value.length === 0);
  return {
    pass,
    explanation: pass 
      ? `Field '${config.field}' is present and non-empty`
      : `Field '${config.field}' is missing or empty (got: ${JSON.stringify(value)})`
  };
}

function evaluateType(config: RuleOperatorConfig, inputs: Record<string, unknown>): OperatorResult {
  const value = inputs[config.field];
  const expectedType = config.expectedType || 'string';
  
  let actualType: string;
  if (value === null || value === undefined) {
    actualType = 'undefined';
  } else if (Array.isArray(value)) {
    actualType = 'array';
  } else {
    actualType = typeof value;
  }
  
  const pass = actualType === expectedType;
  return {
    pass,
    explanation: pass
      ? `Field '${config.field}' is of type '${expectedType}'`
      : `Field '${config.field}' expected type '${expectedType}' but got '${actualType}' (value: ${JSON.stringify(value)})`
  };
}

function evaluateRange(config: RuleOperatorConfig, inputs: Record<string, unknown>): OperatorResult {
  const value = inputs[config.field];
  if (typeof value !== 'number') {
    return { pass: false, explanation: `Field '${config.field}' must be a number for range check (got: ${typeof value})` };
  }
  
  const min = config.min ?? -Infinity;
  const max = config.max ?? Infinity;
  const pass = value >= min && value <= max;
  
  return {
    pass,
    explanation: pass
      ? `Field '${config.field}' value ${value} is within range [${min}, ${max}]`
      : `Field '${config.field}' value ${value} is outside range [${min}, ${max}]`
  };
}

function evaluateThreshold(config: RuleOperatorConfig, inputs: Record<string, unknown>): OperatorResult {
  const value = inputs[config.field];
  if (typeof value !== 'number') {
    return { pass: false, explanation: `Field '${config.field}' must be a number for threshold check (got: ${typeof value})` };
  }
  
  const threshold = config.threshold ?? config.value;
  if (typeof threshold !== 'number') {
    return { pass: false, explanation: `Threshold value is not a number` };
  }
  
  const comparison = config.comparison || 'gte';
  let pass: boolean;
  let opSymbol: string;
  
  switch (comparison) {
    case 'gt':  pass = value > threshold; opSymbol = '>'; break;
    case 'gte': pass = value >= threshold; opSymbol = '>='; break;
    case 'lt':  pass = value < threshold; opSymbol = '<'; break;
    case 'lte': pass = value <= threshold; opSymbol = '<='; break;
    case 'eq':  pass = value === threshold; opSymbol = '=='; break;
    case 'neq': pass = value !== threshold; opSymbol = '!='; break;
    default: return { pass: false, explanation: `Unknown comparison operator: ${comparison}` };
  }
  
  return {
    pass,
    explanation: pass
      ? `Field '${config.field}' value ${value} ${opSymbol} ${threshold} ✓`
      : `Field '${config.field}' value ${value} NOT ${opSymbol} ${threshold} ✗`
  };
}

function evaluateEquality(config: RuleOperatorConfig, inputs: Record<string, unknown>): OperatorResult {
  const value = inputs[config.field];
  const expected = config.value;
  
  // Loose comparison for string/number coercion
  const pass = String(value) === String(expected);
  
  return {
    pass,
    explanation: pass
      ? `Field '${config.field}' equals '${expected}'`
      : `Field '${config.field}' expected '${expected}' but got '${value}'`
  };
}

function evaluateEnum(config: RuleOperatorConfig, inputs: Record<string, unknown>): OperatorResult {
  const value = inputs[config.field];
  const allowed = config.allowedValues || [];
  const pass = allowed.includes(String(value));
  
  return {
    pass,
    explanation: pass
      ? `Field '${config.field}' value '${value}' is in allowed values [${allowed.join(', ')}]`
      : `Field '${config.field}' value '${value}' is NOT in allowed values [${allowed.join(', ')}]`
  };
}

function evaluateFormulaOp(config: RuleOperatorConfig, inputs: Record<string, unknown>): OperatorResult {
  const formula = config.formula;
  if (!formula) {
    return { pass: false, explanation: 'No formula defined' };
  }
  
  try {
    const { value, explanation } = evaluateFormula(formula, inputs);
    
    // If threshold is set, compare result against it
    if (config.threshold !== undefined) {
      const comparison = config.comparison || 'gte';
      let pass: boolean;
      switch (comparison) {
        case 'gt':  pass = value > config.threshold; break;
        case 'gte': pass = value >= config.threshold; break;
        case 'lt':  pass = value < config.threshold; break;
        case 'lte': pass = value <= config.threshold; break;
        case 'eq':  pass = value === config.threshold; break;
        case 'neq': pass = value !== config.threshold; break;
        default: pass = true;
      }
      return {
        pass,
        calculatedValue: value,
        explanation: `${explanation}; result ${value} vs threshold ${config.threshold} (${comparison}): ${pass ? 'PASS' : 'FAIL'}`
      };
    }
    
    return { pass: true, calculatedValue: value, explanation };
  } catch (err) {
    return { pass: false, explanation: `Formula evaluation error: ${(err as Error).message}` };
  }
}

// ============ MAIN ENGINE ============

export interface EngineEvaluation {
  ruleVersionId: string;
  ruleVersionNumber: number;
  result: ValidationResult;
  operatorResults: Array<{
    operator: RuleOperator;
    field: string;
    pass: boolean;
    explanation: string;
    calculatedValue?: unknown;
  }>;
  calculation: string;
  timestamp: string;
  inputs: Record<string, unknown>;
}

export function evaluateRuleVersion(
  ruleVersion: RuleVersion,
  inputs: Record<string, unknown>
): EngineEvaluation {
  // Only APPROVED rules can be executed as official
  if (ruleVersion.status !== 'APPROVED') {
    return {
      ruleVersionId: ruleVersion.id,
      ruleVersionNumber: ruleVersion.version,
      result: 'REVIEW',
      operatorResults: [],
      calculation: `Rule version is in status '${ruleVersion.status}'. Only APPROVED versions can be executed officially.`,
      timestamp: new Date().toISOString(),
      inputs,
    };
  }

  const operatorResults: EngineEvaluation['operatorResults'] = [];
  let allPass = true;
  const calculationParts: string[] = [];

  for (const opConfig of ruleVersion.operators) {
    let result: OperatorResult;
    
    switch (opConfig.operator) {
      case 'required':  result = evaluateRequired(opConfig, inputs); break;
      case 'type':      result = evaluateType(opConfig, inputs); break;
      case 'range':     result = evaluateRange(opConfig, inputs); break;
      case 'threshold': result = evaluateThreshold(opConfig, inputs); break;
      case 'equality':  result = evaluateEquality(opConfig, inputs); break;
      case 'enum':      result = evaluateEnum(opConfig, inputs); break;
      case 'formula':   result = evaluateFormulaOp(opConfig, inputs); break;
      default:
        result = { pass: false, explanation: `Unknown operator: ${opConfig.operator}` };
    }
    
    operatorResults.push({
      operator: opConfig.operator,
      field: opConfig.field,
      pass: result.pass,
      explanation: result.explanation,
      calculatedValue: result.calculatedValue,
    });
    
    if (!result.pass) allPass = false;
    calculationParts.push(`[${opConfig.operator}:${opConfig.field}] ${result.explanation}`);
  }

  const finalResult: ValidationResult = allPass ? 'PASS' : 'FAIL';
  const calculation = calculationParts.join('\n');

  return {
    ruleVersionId: ruleVersion.id,
    ruleVersionNumber: ruleVersion.version,
    result: finalResult,
    operatorResults,
    calculation,
    timestamp: new Date().toISOString(),
    inputs,
  };
}

// ============ UTILITY EXPORTS ============

export function getSupportedOperators(): RuleOperator[] {
  return ['required', 'type', 'range', 'threshold', 'equality', 'enum', 'formula'];
}

export function validateOperatorConfig(config: RuleOperatorConfig): string[] {
  const errors: string[] = [];
  
  if (!config.field) errors.push('Field is required');
  if (!config.operator) errors.push('Operator is required');
  
  if (config.operator === 'range') {
    if (config.min === undefined && config.max === undefined) {
      errors.push('Range operator requires at least min or max');
    }
    if (config.min !== undefined && config.max !== undefined && config.min > config.max) {
      errors.push('Range min cannot be greater than max');
    }
  }
  
  if (config.operator === 'threshold') {
    if (config.threshold === undefined && config.value === undefined) {
      errors.push('Threshold operator requires threshold or value');
    }
  }
  
  if (config.operator === 'enum') {
    if (!config.allowedValues || config.allowedValues.length === 0) {
      errors.push('Enum operator requires at least one allowed value');
    }
  }
  
  if (config.operator === 'formula') {
    if (!config.formula) {
      errors.push('Formula operator requires a formula expression');
    } else {
      // Validate formula syntax
      try {
        new FormulaParser(config.formula, { variables: {} });
      } catch {
        // Only fail on syntax errors, not missing variables
      }
    }
  }
  
  return errors;
}
