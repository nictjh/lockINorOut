export type Level = {
  id: string;
  name: string;
  description: string;
  icon: string;
  path: string;
  order: number;
};

export const LEVELS: Level[] = [
  {
    id: "git-pull",
    name: "Git Pull",
    description: "Learn to pull code from the repository without breaking it",
    icon: "⬇️",
    path: "/levels/git-pull",
    order: 1,
  },
  {
    id: "git-push",
    name: "Git Push",
    description: "Push your code changes to the repository",
    icon: "⬆️",
    path: "/levels/git-push",
    order: 2,
  },
  {
    id: "git-merge",
    name: "Git Merge",
    description: "Merge branches without causing conflicts",
    icon: "🔀",
    path: "/levels/git-merge",
    order: 3,
  },
  {
    id: "git-branch",
    name: "Git Branch",
    description: "Create and manage branches",
    icon: "🌿",
    path: "/levels/git-branch",
    order: 4,
  },
  {
    id: "git-commit",
    name: "Git Commit",
    description: "Master the art of committing code",
    icon: "💾",
    path: "/levels/git-commit",
    order: 5,
  },
  {
    id: "git-rebase",
    name: "Git Rebase",
    description: "Rewrite history like a pro",
    icon: "✏️",
    path: "/levels/git-rebase",
    order: 6,
  },
  {
    id: "git-reset",
    name: "Git Reset",
    description: "Undo changes and go back in time",
    icon: "⏮️",
    path: "/levels/git-reset",
    order: 7,
  },
];

export function getLevelById(id: string): Level | undefined {
  return LEVELS.find((level) => level.id === id);
}

export function getLevelByOrder(order: number): Level | undefined {
  return LEVELS.find((level) => level.order === order);
}
