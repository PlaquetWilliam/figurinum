import { defineConfig } from "vitest/config";
import path from "path";

// Configuration Vitest — logique métier testée en environnement Node,
// sans dépendance à une base MongoDB réelle (les modèles sont mockés,
// cf. tests/actions/*.test.ts). L'alias @/ reproduit celui de tsconfig.json
// pour que les tests importent les modules exactement comme le code applicatif.
export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
    globals: false,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname),
    },
  },
});
