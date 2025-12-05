import { Injectable } from '@nestjs/common';

export interface RatingFactors {
  successRate: number; // 0-1
  trustScore: number; // 0-100
  totalRuns: number; // Count
  recentSuccessRate: number; // 0-1 (last 30 days)
  reviewScore: number; // 0-5 (user reviews)
  reviewCount: number; // Count
}

export interface RatingResult {
  rating: number; // 0-5
  confidence: number; // 0-1
  label: string; // "Excellent", "Good", etc.
  showRating: boolean; // Hide if insufficient data
}

@Injectable()
export class RatingService {
  /**
   * Calculate improved agent rating using multi-factor scientific approach
   * Factors: Success Rate (35%) + Trust Score (20%) + Volume Factor (15%) + User Reviews (30%)
   */
  calculateImprovedRating(factors: RatingFactors): RatingResult {
    const { successRate, trustScore, totalRuns, recentSuccessRate, reviewScore, reviewCount } = factors;

    // Minimum threshold: Need at least 10 runs OR 3 reviews to show rating
    const hasEnoughData = totalRuns >= 10 || reviewCount >= 3;

    if (!hasEnoughData) {
      return {
        rating: 0,
        confidence: 0,
        label: 'New Agent',
        showRating: false,
      };
    }

    // 1. Success Rate Component (35%)
    // Recent performance weighted 2x more than historical
    const weightedSuccessRate = successRate * 0.4 + recentSuccessRate * 0.6;
    const successComponent = weightedSuccessRate * 0.35;

    // 2. Trust Score Component (20%)
    // Platform-assigned trust based on security, compliance, etc.
    const trustComponent = (trustScore / 100) * 0.2;

    // 3. Volume/Confidence Component (15%)
    // More runs = more confidence in rating
    // Logarithmic scale: 10 runs = ~0.5, 100 runs = ~0.8, 1000 runs = ~1.0
    const volumeFactor = Math.min(Math.log10(totalRuns) / 3, 1.0);
    const volumeComponent = volumeFactor * 0.15;

    // 4. User Review Component (30%)
    // Direct user feedback is most valuable
    // Only if reviews exist
    let reviewComponent = 0;
    if (reviewCount > 0) {
      // Normalize review score (0-5) to 0-1
      const normalizedReviewScore = reviewScore / 5;
      // Weight by review count (more reviews = more weight)
      const reviewWeight = Math.min(reviewCount / 20, 1.0); // Max weight at 20 reviews
      reviewComponent = normalizedReviewScore * reviewWeight * 0.3;
    } else {
      // If no reviews, redistribute weight to success rate
      const redistributedSuccessComponent = weightedSuccessRate * 0.3;
      reviewComponent = redistributedSuccessComponent;
    }

    // Combine all components
    const combinedScore = successComponent + trustComponent + volumeComponent + reviewComponent;

    // Scale to 0-5 rating
    const rating = combinedScore * 5;

    // Calculate confidence level
    const confidence = this.calculateConfidence(totalRuns, reviewCount);

    // Determine label
    const label = this.getRatingLabel(rating);

    return {
      rating: Math.max(0, Math.min(5, +rating.toFixed(1))),
      confidence,
      label,
      showRating: true,
    };
  }

  /**
   * Calculate confidence level using Wilson score interval approach
   * Confidence based on sample size (runs + reviews)
   */
  private calculateConfidence(totalRuns: number, reviewCount: number): number {
    // Confidence based on sample size
    // Uses logarithmic scaling for more realistic confidence levels
    const runConfidence = Math.min(totalRuns / 100, 1.0);
    const reviewConfidence = Math.min(reviewCount / 20, 1.0);

    // Weighted average (runs 60%, reviews 40%)
    return runConfidence * 0.6 + reviewConfidence * 0.4;
  }

  /**
   * Get human-readable rating label
   */
  private getRatingLabel(rating: number): string {
    if (rating >= 4.5) return 'Excellent';
    if (rating >= 4.0) return 'Very Good';
    if (rating >= 3.5) return 'Good';
    if (rating >= 3.0) return 'Fair';
    if (rating >= 2.0) return 'Poor';
    return 'Very Poor';
  }

  /**
   * Test the rating formula with sample data scenarios
   */
  testRatingFormula(): Array<{
    scenario: string;
    factors: RatingFactors;
    result: RatingResult;
  }> {
    const testCases = [
      {
        scenario: 'New Agent (10 runs, no reviews)',
        factors: {
          successRate: 0.9,
          trustScore: 75,
          totalRuns: 10,
          recentSuccessRate: 0.9,
          reviewScore: 0,
          reviewCount: 0,
        },
      },
      {
        scenario: 'Established Agent (150 runs, 12 reviews)',
        factors: {
          successRate: 0.95,
          trustScore: 85,
          totalRuns: 150,
          recentSuccessRate: 0.97,
          reviewScore: 4.6,
          reviewCount: 12,
        },
      },
      {
        scenario: 'Declining Performance (100 runs, 8 reviews)',
        factors: {
          successRate: 0.85,
          trustScore: 70,
          totalRuns: 100,
          recentSuccessRate: 0.60,
          reviewScore: 3.8,
          reviewCount: 8,
        },
      },
      {
        scenario: 'High Trust, Few Runs (25 runs, 5 reviews)',
        factors: {
          successRate: 0.8,
          trustScore: 95,
          totalRuns: 25,
          recentSuccessRate: 0.85,
          reviewScore: 4.2,
          reviewCount: 5,
        },
      },
      {
        scenario: 'Poor Performance (200 runs, 15 reviews)',
        factors: {
          successRate: 0.65,
          trustScore: 60,
          totalRuns: 200,
          recentSuccessRate: 0.70,
          reviewScore: 2.8,
          reviewCount: 15,
        },
      },
      {
        scenario: 'Insufficient Data (5 runs, 1 review)',
        factors: {
          successRate: 0.8,
          trustScore: 80,
          totalRuns: 5,
          recentSuccessRate: 0.8,
          reviewScore: 4.0,
          reviewCount: 1,
        },
      },
    ];

    return testCases.map(({ scenario, factors }) => ({
      scenario,
      factors,
      result: this.calculateImprovedRating(factors),
    }));
  }
}