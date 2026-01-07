import taxonomyData from '../data/taxonomy.json';

// Type definitions for the Taxonomy structure

export interface TaxonomyTag {
    definition: string;
    signals: string[];
    parent: string;
    valence?: string;
    nature?: string;
    outcome?: string;
    motivation?: string;
    characteristics?: string[];
    ratio?: string;
    terrainPosition?: number;
}

export interface TaxonomyDimension {
    category: string;
    domain: string;
    description: string;
    isDistribution?: boolean;
    tieBreakers?: string[];
    tags: Record<string, TaxonomyTag>;
}

export interface Taxonomy {
    version: string;
    promptVersion: string;
    totalDimensions: number;
    generatedFrom: string;
    lastUpdated: string;
    dimensions: Record<string, TaxonomyDimension>;
}

/**
 * Type-safe accessor for the Classification Taxonomy.
 * Use this instead of importing the raw JSON to ensure type safety.
 */
export const TAXONOMY = taxonomyData as Taxonomy;

/**
 * Helper to get all tags for a specific dimension
 */
export function getDimensionTags(dimensionKey: keyof typeof TAXONOMY.dimensions): string[] {
    const dim = TAXONOMY.dimensions[dimensionKey];
    return dim ? Object.keys(dim.tags) : [];
}

/**
 * Helper to get detailed tag info
 */
export function getTagInfo(dimensionKey: string, tagKey: string): TaxonomyTag | null {
    const dim = TAXONOMY.dimensions[dimensionKey];
    if (!dim) return null;
    return dim.tags[tagKey] || null;
}
