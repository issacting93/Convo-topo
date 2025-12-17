# Archived Documentation

This directory contains documentation for **rule-based/algorithmic classification approaches** that are **NOT currently implemented**.

## Current System

The **active classification system** is:
- **LLM-based classifier v1.1** (see `classifier-v1.1.py` and `classifier-v1.1.ts`)
- Uses Claude API (Anthropic) for classification
- Outputs probability distributions for role dimensions
- See `README-v1.1.md` for current documentation

## Archived Files

### `rule-based-formulas.md`
- Original: `CALCULATION_FORMULAS.md`
- Describes algorithmic/rule-based classification approach
- Uses old role taxonomy: `initiator`, `responder`, `listener`, `companion`
- **Status**: Not implemented - kept for reference/historical purposes

### `formula-quick-reference.md`
- Original: `FORMULA_QUICK_REFERENCE.md`
- Quick reference for rule-based formulas
- **Status**: Not implemented - kept for reference

## Why Archived?

The rule-based approach was replaced by LLM-based classification because:
1. **Better accuracy**: LLM context understanding > keyword matching
2. **Evidence-based**: Classifier provides quotes and rationale
3. **Distribution outputs**: Roles output as probabilities (more nuanced)
4. **Maintainability**: Easier to update prompt than complex rule sets

## If You Want to Implement Rule-Based System

These files provide a complete mathematical foundation for implementing rule-based classification. However, the current LLM-based approach is recommended for production use.

