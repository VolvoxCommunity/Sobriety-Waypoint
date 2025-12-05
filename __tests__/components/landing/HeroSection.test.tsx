// =============================================================================
// Imports
// =============================================================================
import React from 'react';
import HeroSection from '../../../components/landing/HeroSection';
import { renderWithProviders } from '../../test-utils';

// =============================================================================
// Mocks
// =============================================================================

// Mock expo-router
jest.mock('expo-router', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  })),
}));

// =============================================================================
// Tests
// =============================================================================

describe('HeroSection', () => {
  it('renders app name and tagline', () => {
    const { getByText } = renderWithProviders(<HeroSection />);

    expect(getByText('Sobriety Waypoint')).toBeTruthy();
    expect(getByText('Your Companion on the Path to Recovery')).toBeTruthy();
  });

  it('renders CTA buttons', () => {
    const { getByText } = renderWithProviders(<HeroSection />);

    expect(getByText('Get Started Free')).toBeTruthy();
    expect(getByText('Sign In')).toBeTruthy();
  });

  it('renders free forever badge', () => {
    const { getByText } = renderWithProviders(<HeroSection />);

    expect(getByText(/Free Forever.*No Ads.*No Catch/)).toBeTruthy();
  });

  it('renders encouraging quote', () => {
    const { getByText } = renderWithProviders(<HeroSection />);

    expect(getByText(/Recovery is not a race/i, { exact: false })).toBeTruthy();
  });
});
