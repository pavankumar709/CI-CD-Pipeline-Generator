let nextId = 1;
export function makeStep(name, command) {
  return { id: nextId++, name, command };
}
export function makeJob(name, presetKey) {
  const preset = PRESETS[presetKey];
  return {
    id: nextId++,
    name,
    presetKey,
    language: preset.language,
    version: preset.version,
    steps: preset.steps(),
  };
}

export const CATEGORIES = [
  { key: "frontend", label: "Frontend" },
  { key: "backend", label: "Backend" },
  { key: "database", label: "Database / Migrations" },
  { key: "other", label: "Other" },
];

export const PRESETS = {
  react: {
    label: "React", category: "frontend", language: "node", version: "20",
    steps: () => [makeStep("Install dependencies", "npm ci"), makeStep("Lint", "npm run lint"), makeStep("Run tests", "npm test"), makeStep("Build", "npm run build")],
  },
  vue: {
    label: "Vue", category: "frontend", language: "node", version: "20",
    steps: () => [makeStep("Install dependencies", "npm ci"), makeStep("Lint", "npm run lint"), makeStep("Build", "npm run build")],
  },
  angular: {
    label: "Angular", category: "frontend", language: "node", version: "20",
    steps: () => [makeStep("Install dependencies", "npm ci"), makeStep("Lint", "ng lint"), makeStep("Test", "ng test --watch=false"), makeStep("Build", "ng build --configuration production")],
  },
  next: {
    label: "Next.js", category: "frontend", language: "node", version: "20",
    steps: () => [makeStep("Install dependencies", "npm ci"), makeStep("Lint", "npm run lint"), makeStep("Build", "npm run build")],
  },
  svelte: {
    label: "Svelte", category: "frontend", language: "node", version: "20",
    steps: () => [makeStep("Install dependencies", "npm ci"), makeStep("Build", "npm run build")],
  },

  node: {
    label: "Node.js / Express", category: "backend", language: "node", version: "20",
    steps: () => [makeStep("Install dependencies", "npm ci"), makeStep("Run tests", "npm test")],
  },
  dotnet: {
    label: ".NET / ASP.NET Core", category: "backend", language: "dotnet", version: "8.0",
    steps: () => [makeStep("Restore", "dotnet restore"), makeStep("Build", "dotnet build --configuration Release --no-restore"), makeStep("Test", "dotnet test --no-build --verbosity normal")],
  },
  spring: {
    label: "Java / Spring Boot", category: "backend", language: "java", version: "21",
    steps: () => [makeStep("Build", "mvn -B package --file pom.xml"), makeStep("Test", "mvn -B test")],
  },
  go: {
    label: "Go", category: "backend", language: "go", version: "1.22",
    steps: () => [makeStep("Download modules", "go mod download"), makeStep("Vet", "go vet ./..."), makeStep("Test", "go test ./..."), makeStep("Build", "go build ./...")],
  },
  rails: {
    label: "Ruby on Rails", category: "backend", language: "ruby", version: "3.3",
    steps: () => [makeStep("Install dependencies", "bundle install"), makeStep("Run tests", "bundle exec rspec")],
  },
  laravel: {
    label: "PHP / Laravel", category: "backend", language: "php", version: "8.3",
    steps: () => [makeStep("Install dependencies", "composer install --prefer-dist --no-progress"), makeStep("Run tests", "php artisan test")],
  },
  django: {
    label: "Python / Django", category: "backend", language: "python", version: "3.12",
    steps: () => [makeStep("Install dependencies", "pip install -r requirements.txt"), makeStep("Run tests", "python manage.py test")],
  },
  flask: {
    label: "Python / Flask", category: "backend", language: "python", version: "3.12",
    steps: () => [makeStep("Install dependencies", "pip install -r requirements.txt"), makeStep("Run tests", "pytest")],
  },

  efcore: {
    label: "EF Core (.NET)", category: "database", language: "dotnet", version: "8.0",
    steps: () => [makeStep("Restore", "dotnet restore"), makeStep("Apply migrations", "dotnet ef database update")],
  },
  flyway: {
    label: "Flyway", category: "database", language: "none", version: "",
    steps: () => [makeStep("Migrate", "flyway -url=$DB_URL -user=$DB_USER -password=$DB_PASSWORD migrate")],
  },
  djangoMigrate: {
    label: "Django migrate", category: "database", language: "python", version: "3.12",
    steps: () => [makeStep("Install dependencies", "pip install -r requirements.txt"), makeStep("Apply migrations", "python manage.py migrate")],
  },
  prisma: {
    label: "Prisma", category: "database", language: "node", version: "20",
    steps: () => [makeStep("Install dependencies", "npm ci"), makeStep("Apply migrations", "npx prisma migrate deploy")],
  },
  alembic: {
    label: "Alembic (SQLAlchemy)", category: "database", language: "python", version: "3.12",
    steps: () => [makeStep("Install dependencies", "pip install -r requirements.txt"), makeStep("Apply migrations", "alembic upgrade head")],
  },
  railsMigrate: {
    label: "Rails db:migrate", category: "database", language: "ruby", version: "3.3",
    steps: () => [makeStep("Install dependencies", "bundle install"), makeStep("Apply migrations", "bundle exec rails db:migrate")],
  },

  blank: {
    label: "Blank (start from scratch)", category: "other", language: "none", version: "",
    steps: () => [],
  },
};

export function getPresetsByCategory(category) {
  return Object.entries(PRESETS).filter(([, p]) => p.category === category);
}
