import type { ReactNode } from "react";
import { vi } from "vitest";

// Mock user data
export const mockUser = {
  _id: "user123" as const,
  _creationTime: Date.now(),
  name: "Test User",
  email: "test@example.com",
  username: "testuser",
  bio: "Test bio",
  image: null,
  profileImageUrl: null,
};

export const mockRecipe = {
  _id: "recipe123" as const,
  _creationTime: Date.now(),
  slug: "test-recipe",
  title: "Test Recipe",
  description: "A test recipe description",
  category: "Dinner",
  ingredients: ["1 cup flour", "2 eggs", "1/2 cup milk"],
  steps: ["Mix ingredients", "Cook for 20 minutes", "Serve hot"],
  coverImage: null,
  coverImageUrl: null,
  videoUrl: null,
  status: "published" as const,
  userId: "user123" as const,
  servings: 4,
  prepTime: 15,
  cookTime: 30,
  likesCount: 5,
  isLiked: false,
  isBookmarked: false,
  author: {
    name: "Test User",
    username: "testuser",
    image: null,
  },
};

export const mockRecipes = [
  mockRecipe,
  { ...mockRecipe, _id: "recipe456", slug: "another-recipe", title: "Another Recipe" },
  { ...mockRecipe, _id: "recipe789", slug: "third-recipe", title: "Third Recipe", category: "Breakfast" },
];

// Mock Convex hooks
export const createMockConvexProvider = () => {
  return ({ children }: { children: ReactNode }) => children;
};

export const mockUseQuery = vi.fn();
export const mockUseMutation = vi.fn(() => vi.fn());
export const mockUseAction = vi.fn(() => vi.fn());

// Mock auth
export const mockUseAuthActions = vi.fn(() => ({
  signIn: vi.fn(),
  signOut: vi.fn(),
}));

// Mock toast
export const mockToast = vi.fn();
export const mockUseToast = vi.fn(() => ({ toast: mockToast }));

// Mock router
export const mockNavigate = vi.fn();
export const mockUseNavigate = vi.fn(() => mockNavigate);
export const mockUseParams = vi.fn(() => ({}));
export const mockUseSearch = vi.fn(() => ({}));
