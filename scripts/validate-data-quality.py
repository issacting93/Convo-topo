#!/usr/bin/env python3
"""
Comprehensive Data Quality Validation

Validates that conversation data makes logical sense:
- Schema compliance
- Value ranges (PAD scores, confidence, role distributions)
- Logical consistency (e.g., role distributions sum to 1.0)
- Cross-field validation (e.g., emotional tone vs PAD pleasure)
- Anomaly detection (unusual patterns)
- Business logic validation
"""

import json
import sys
from pathlib import Path
from collections import defaultdict
from typing import Dict, List, Optional, Tuple
import statistics

OUTPUT_DIR = Path("public/output")

# Expected ranges
PAD_RANGE = (0.0, 1.0)
CONFIDENCE_RANGE = (0.0, 1.0)
ROLE_DIST_TOLERANCE = 0.01  # Allow small floating point errors

# Expected relationships
EMOTIONAL_TONE_TO_PLEASURE = {
    "playful": (0.6, 1.0),
    "supportive": (0.6, 1.0),
    "empathetic": (0.6, 1.0),
    "neutral": (0.4, 0.7),
    "serious": (0.2, 0.5),
    "professional": (0.4, 0.7),
    "frustrated": (0.0, 0.3),
    "challenging": (0.2, 0.5),
}

ENGAGEMENT_STYLE_TO_AROUSAL = {
    "questioning": (0.5, 1.0),
    "exploring": (0.4, 0.8),
    "reactive": (0.2, 0.5),
    "affirming": (0.3, 0.6),
    "challenging": (0.6, 1.0),
}

HUMAN_ROLES = ["seeker", "learner", "director", "collaborator", "sharer", "challenger"]
AI_ROLES = ["expert", "advisor", "facilitator", "reflector", "peer", "affiliative"]


class ValidationIssue:
    def __init__(self, severity: str, category: str, message: str, file: str, details: Optional[Dict] = None):
        self.severity = severity  # "error", "warning", "info"
        self.category = category  # "schema", "range", "consistency", "anomaly"
        self.message = message
        self.file = file
        self.details = details or {}

    def __str__(self):
        return f"[{self.severity.upper()}] {self.file}: {self.message}"


def validate_schema(conv: Dict, file_name: str) -> List[ValidationIssue]:
    """Validate basic schema structure"""
    issues = []
    
    # Required top-level fields
    if "id" not in conv:
        issues.append(ValidationIssue("error", "schema", "Missing 'id' field", file_name))
    
    if "messages" not in conv:
        issues.append(ValidationIssue("error", "schema", "Missing 'messages' field", file_name))
    elif not isinstance(conv["messages"], list) or len(conv["messages"]) == 0:
        issues.append(ValidationIssue("error", "schema", "Messages must be a non-empty list", file_name))
    
    # Check classification structure
    if "classification" in conv:
        classification = conv["classification"]
        
        # Handle NoneType classification
        if classification is None:
            issues.append(ValidationIssue("error", "schema", 
                "Classification is None", file_name))
            return issues
        
        # Ensure classification is a dict
        if not isinstance(classification, dict):
            issues.append(ValidationIssue("error", "schema", 
                f"Classification is not a dict: {type(classification)}", file_name))
            return issues
        
        required_dims = ["interactionPattern", "powerDynamics", "emotionalTone", 
                        "engagementStyle", "knowledgeExchange", "conversationPurpose", 
                        "turnTaking", "humanRole", "aiRole"]
        
        for dim in required_dims:
            if dim not in classification:
                issues.append(ValidationIssue("warning", "schema", 
                    f"Missing classification dimension: {dim}", file_name))
    
    return issues


def validate_pad_ranges(conv: Dict, file_name: str) -> List[ValidationIssue]:
    """Validate PAD scores are in valid ranges"""
    issues = []
    messages = conv.get("messages", [])
    
    for i, msg in enumerate(messages):
        if "pad" not in msg:
            issues.append(ValidationIssue("error", "range", 
                f"Message {i} missing PAD data", file_name, {"message_index": i}))
            continue
        
        pad = msg["pad"]
        required_fields = ["pleasure", "arousal", "dominance", "emotionalIntensity"]
        
        for field in required_fields:
            if field not in pad:
                issues.append(ValidationIssue("error", "range", 
                    f"Message {i} missing PAD field: {field}", file_name, 
                    {"message_index": i, "field": field}))
                continue
            
            value = pad[field]
            if not isinstance(value, (int, float)):
                issues.append(ValidationIssue("error", "range", 
                    f"Message {i} PAD.{field} is not a number: {value}", file_name,
                    {"message_index": i, "field": field, "value": value}))
                continue
            
            if not (PAD_RANGE[0] <= value <= PAD_RANGE[1]):
                issues.append(ValidationIssue("error", "range", 
                    f"Message {i} PAD.{field} out of range: {value} (expected {PAD_RANGE[0]}-{PAD_RANGE[1]})", 
                    file_name, {"message_index": i, "field": field, "value": value}))
    
    return issues


def validate_role_distributions(conv: Dict, file_name: str) -> List[ValidationIssue]:
    """Validate role distributions sum to 1.0 and have valid keys"""
    issues = []
    classification = conv.get("classification", {})
    
    # Check humanRole
    if "humanRole" in classification:
        human_role = classification["humanRole"]
        if "distribution" in human_role:
            dist = human_role["distribution"]
            total = sum(dist.values())
            
            if abs(total - 1.0) > ROLE_DIST_TOLERANCE:
                issues.append(ValidationIssue("error", "consistency", 
                    f"humanRole distribution sums to {total:.4f}, expected 1.0", file_name,
                    {"total": total, "distribution": dist}))
            
            # Check for unknown roles
            for role in dist.keys():
                if role not in HUMAN_ROLES:
                    issues.append(ValidationIssue("warning", "schema", 
                        f"Unknown humanRole: {role}", file_name, {"role": role}))
    
    # Check aiRole
    if "aiRole" in classification:
        ai_role = classification["aiRole"]
        if "distribution" in ai_role:
            dist = ai_role["distribution"]
            total = sum(dist.values())
            
            if abs(total - 1.0) > ROLE_DIST_TOLERANCE:
                issues.append(ValidationIssue("error", "consistency", 
                    f"aiRole distribution sums to {total:.4f}, expected 1.0", file_name,
                    {"total": total, "distribution": dist}))
            
            # Check for unknown roles
            for role in dist.keys():
                if role not in AI_ROLES:
                    issues.append(ValidationIssue("warning", "schema", 
                        f"Unknown aiRole: {role}", file_name, {"role": role}))
    
    return issues


def validate_confidence_scores(conv: Dict, file_name: str) -> List[ValidationIssue]:
    """Validate confidence scores are in valid ranges"""
    issues = []
    classification = conv.get("classification", {})
    
    for dim_name, dim_data in classification.items():
        if isinstance(dim_data, dict) and "confidence" in dim_data:
            confidence = dim_data["confidence"]
            
            if not isinstance(confidence, (int, float)):
                issues.append(ValidationIssue("warning", "range", 
                    f"{dim_name}.confidence is not a number: {confidence}", file_name,
                    {"dimension": dim_name, "confidence": confidence}))
                continue
            
            if not (CONFIDENCE_RANGE[0] <= confidence <= CONFIDENCE_RANGE[1]):
                issues.append(ValidationIssue("warning", "range", 
                    f"{dim_name}.confidence out of range: {confidence}", file_name,
                    {"dimension": dim_name, "confidence": confidence}))
    
    return issues


def validate_cross_field_consistency(conv: Dict, file_name: str) -> List[ValidationIssue]:
    """Validate logical relationships between fields"""
    issues = []
    classification = conv.get("classification", {})
    messages = conv.get("messages", [])
    
    # Check emotionalTone vs average PAD pleasure
    if "emotionalTone" in classification and messages:
        tone = classification["emotionalTone"]
        if isinstance(tone, dict) and "category" in tone:
            tone_category = tone["category"].lower()
            
            # Calculate average pleasure
            pleasures = [msg.get("pad", {}).get("pleasure") for msg in messages if "pad" in msg and "pleasure" in msg.get("pad", {})]
            if pleasures:
                avg_pleasure = statistics.mean(pleasures)
                
                # Check if it matches expected range
                if tone_category in EMOTIONAL_TONE_TO_PLEASURE:
                    expected_range = EMOTIONAL_TONE_TO_PLEASURE[tone_category]
                    if not (expected_range[0] <= avg_pleasure <= expected_range[1]):
                        issues.append(ValidationIssue("warning", "consistency", 
                            f"emotionalTone '{tone_category}' but avg pleasure is {avg_pleasure:.2f} (expected {expected_range[0]}-{expected_range[1]})", 
                            file_name, {"tone": tone_category, "avg_pleasure": avg_pleasure, "expected": expected_range}))
    
    # Check engagementStyle vs average PAD arousal
    if "engagementStyle" in classification and messages:
        style = classification["engagementStyle"]
        if isinstance(style, dict) and "category" in style:
            style_category = style["category"].lower()
            
            # Calculate average arousal
            arousals = [msg.get("pad", {}).get("arousal") for msg in messages if "pad" in msg and "arousal" in msg.get("pad", {})]
            if arousals:
                avg_arousal = statistics.mean(arousals)
                
                # Check if it matches expected range
                if style_category in ENGAGEMENT_STYLE_TO_AROUSAL:
                    expected_range = ENGAGEMENT_STYLE_TO_AROUSAL[style_category]
                    if not (expected_range[0] <= avg_arousal <= expected_range[1]):
                        issues.append(ValidationIssue("warning", "consistency", 
                            f"engagementStyle '{style_category}' but avg arousal is {avg_arousal:.2f} (expected {expected_range[0]}-{expected_range[1]})", 
                            file_name, {"style": style_category, "avg_arousal": avg_arousal, "expected": expected_range}))
    
    return issues


def validate_emotional_intensity_formula(conv: Dict, file_name: str) -> List[ValidationIssue]:
    """Validate that emotionalIntensity matches the formula: (1 - pleasure) * 0.6 + arousal * 0.4"""
    issues = []
    messages = conv.get("messages", [])
    
    for i, msg in enumerate(messages):
        if "pad" not in msg:
            continue
        
        pad = msg["pad"]
        if "pleasure" not in pad or "arousal" not in pad or "emotionalIntensity" not in pad:
            continue
        
        pleasure = pad["pleasure"]
        arousal = pad["arousal"]
        reported_ei = pad["emotionalIntensity"]
        
        # Calculate expected emotional intensity
        expected_ei = (1 - pleasure) * 0.6 + arousal * 0.4
        
        # Allow small floating point errors
        if abs(reported_ei - expected_ei) > 0.01:
            issues.append(ValidationIssue("error", "consistency", 
                f"Message {i} emotionalIntensity mismatch: reported {reported_ei:.4f}, expected {expected_ei:.4f} (formula: (1-{pleasure:.2f})*0.6 + {arousal:.2f}*0.4)", 
                file_name, {"message_index": i, "reported": reported_ei, "expected": expected_ei}))
    
    return issues


def detect_anomalies(conv: Dict, file_name: str) -> List[ValidationIssue]:
    """Detect unusual patterns that might indicate data quality issues"""
    issues = []
    messages = conv.get("messages", [])
    
    if not messages:
        return issues
    
    # Check for duplicate PAD scores across all messages (might indicate rule-based generation issues)
    pad_scores = []
    for msg in messages:
        if "pad" in msg:
            pad = msg["pad"]
            pad_scores.append((pad.get("pleasure"), pad.get("arousal"), pad.get("dominance")))
    
    # Count unique PAD combinations
    unique_pads = len(set(pad_scores))
    if len(messages) > 5 and unique_pads < len(messages) * 0.3:  # Less than 30% unique
        issues.append(ValidationIssue("info", "anomaly", 
            f"Low PAD diversity: {unique_pads} unique PAD combinations out of {len(messages)} messages", 
            file_name, {"unique_pads": unique_pads, "total_messages": len(messages)}))
    
    # Check for all-zero role distributions
    classification = conv.get("classification", {})
    for role_type in ["humanRole", "aiRole"]:
        if role_type in classification:
            role_data = classification[role_type]
            if "distribution" in role_data:
                dist = role_data["distribution"]
                if all(v == 0.0 for v in dist.values()):
                    issues.append(ValidationIssue("error", "anomaly", 
                        f"{role_type} distribution is all zeros", file_name))
    
    # Check for extremely high/low confidence
    for dim_name, dim_data in classification.items():
        if isinstance(dim_data, dict) and "confidence" in dim_data:
            conf = dim_data["confidence"]
            if conf < 0.3:
                issues.append(ValidationIssue("warning", "anomaly", 
                    f"{dim_name} has very low confidence: {conf}", file_name))
            if conf > 0.99:
                issues.append(ValidationIssue("info", "anomaly", 
                    f"{dim_name} has very high confidence: {conf}", file_name))
    
    return issues


def validate_conversation(file_path: Path) -> List[ValidationIssue]:
    """Validate a single conversation file"""
    issues = []
    file_name = file_path.name
    
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            conv = json.load(f)
    except json.JSONDecodeError as e:
        return [ValidationIssue("error", "schema", f"Invalid JSON: {e}", file_name)]
    except Exception as e:
        return [ValidationIssue("error", "schema", f"Error reading file: {e}", file_name)]
    
    # Run all validation checks
    issues.extend(validate_schema(conv, file_name))
    issues.extend(validate_pad_ranges(conv, file_name))
    issues.extend(validate_role_distributions(conv, file_name))
    issues.extend(validate_confidence_scores(conv, file_name))
    issues.extend(validate_emotional_intensity_formula(conv, file_name))
    issues.extend(validate_cross_field_consistency(conv, file_name))
    issues.extend(detect_anomalies(conv, file_name))
    
    return issues


def main():
    """Main validation function"""
    if not OUTPUT_DIR.exists():
        print(f"❌ Output directory not found: {OUTPUT_DIR}")
        sys.exit(1)
    
    json_files = list(OUTPUT_DIR.glob("*.json"))
    json_files = [f for f in json_files if f.name != "manifest.json"]
    
    print(f"🔍 Validating {len(json_files)} conversation files...\n")
    
    all_issues = []
    for file_path in json_files:
        issues = validate_conversation(file_path)
        all_issues.extend(issues)
    
    # Group issues by severity
    errors = [i for i in all_issues if i.severity == "error"]
    warnings = [i for i in all_issues if i.severity == "warning"]
    infos = [i for i in all_issues if i.severity == "info"]
    
    # Print summary
    print("=" * 80)
    print("VALIDATION SUMMARY")
    print("=" * 80)
    print(f"Total files validated: {len(json_files)}")
    print(f"Total issues found: {len(all_issues)}")
    print(f"  Errors: {len(errors)}")
    print(f"  Warnings: {len(warnings)}")
    print(f"  Info: {len(infos)}")
    print()
    
    # Group by category
    by_category = defaultdict(list)
    for issue in all_issues:
        by_category[issue.category].append(issue)
    
    print("Issues by category:")
    for category, category_issues in sorted(by_category.items()):
        print(f"  {category}: {len(category_issues)}")
    print()
    
    # Show errors
    if errors:
        print("=" * 80)
        print("ERRORS (must fix)")
        print("=" * 80)
        for issue in errors[:20]:  # Show first 20
            print(f"  {issue}")
        if len(errors) > 20:
            print(f"  ... and {len(errors) - 20} more errors")
        print()
    
    # Show warnings
    if warnings:
        print("=" * 80)
        print("WARNINGS (should review)")
        print("=" * 80)
        for issue in warnings[:20]:  # Show first 20
            print(f"  {issue}")
        if len(warnings) > 20:
            print(f"  ... and {len(warnings) - 20} more warnings")
        print()
    
    # Show info (anomalies)
    if infos:
        print("=" * 80)
        print("INFO (anomalies detected)")
        print("=" * 80)
        for issue in infos[:10]:  # Show first 10
            print(f"  {issue}")
        if len(infos) > 10:
            print(f"  ... and {len(infos) - 10} more info items")
        print()
    
    # Save detailed report
    report_path = Path("reports/validation-report.json")
    report_path.parent.mkdir(parents=True, exist_ok=True)
    
    report = {
        "timestamp": str(Path(__file__).stat().st_mtime),
        "total_files": len(json_files),
        "summary": {
            "total_issues": len(all_issues),
            "errors": len(errors),
            "warnings": len(warnings),
            "info": len(infos)
        },
        "by_category": {cat: len(issues) for cat, issues in by_category.items()},
        "issues": [
            {
                "severity": issue.severity,
                "category": issue.category,
                "message": issue.message,
                "file": issue.file,
                "details": issue.details
            }
            for issue in all_issues
        ]
    }
    
    with open(report_path, 'w') as f:
        json.dump(report, f, indent=2)
    
    print(f"✅ Detailed report saved to: {report_path}")
    print()
    
    # Exit code based on errors
    if errors:
        print("❌ Validation failed: errors found")
        sys.exit(1)
    elif warnings:
        print("⚠️  Validation passed with warnings")
        sys.exit(0)
    else:
        print("✅ Validation passed: no issues found")
        sys.exit(0)


if __name__ == "__main__":
    main()

